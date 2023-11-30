import { z } from "zod";
import { kv } from "@vercel/kv";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import generateKeyPair from "~/server/utils/crypto/generate-key-pair";
import createSignedString from "~/server/utils/crypto/create-signed-string";
import { createCookieVerification } from "~/server/utils/cookies";
import { sendVerificationEmail } from "~/server/utils/auth/send-verification-email";
import {
  createEmailVerificationJwt,
  verifyEmailVerificationJwt,
} from "~/server/utils/auth/verification-jwt";
import { cookies } from "next/headers";
import {
  rateLimitUserIp,
  verifyUserIp,
} from "~/server/utils/auth/email-rate-limits";

export const accountsRouter = createTRPCRouter({
  getCurrentSession: privateProcedure.query(
    async ({ ctx: { userSession, user } }) => ({
      userSession,
      user,
    }),
  ),
  login: publicProcedure.input(z.object({
    email: z.string().email(),
  })).mutation(async ({ ctx: { db, headers }, input }) => {
    const userIp = headers.get("x-forwarded-for");
    const { block, timeDiffInSeconds } = await verifyUserIp(
      userIp,
    );
    if (block) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You are being rate limited${
          timeDiffInSeconds
            ? `, please wait ${timeDiffInSeconds} ${
              timeDiffInSeconds > 1 ? "seconds" : "second"
            } and try again.`
            : "."
        }`,
      });
    }

    const user = await db.user.findUnique({
      where: {
        email: input.email,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "This user does not exist.",
      });
    }

    const emailData = await sendVerificationEmail({ userId: user.id });
    if (emailData.error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: emailData.errorMessage ?? "Failed to send email",
      });
    }

    await rateLimitUserIp(userIp);

    const cookieVerificationToken = createCookieVerification(
      "email-verification-token",
    );
    const emailVerificationToken = createEmailVerificationJwt(user.id);

    return {
      redirectTo: `/account/verify/${user.id}`,
      emailVerificationToken,
      cookieVerificationToken,
    };
  }),
  verifyCode: publicProcedure.input(
    z.object({
      userId: z.string(),
      code: z.string(),
      verifySeshId: z.string().nullish().optional(),
    }),
  ).mutation(async ({ ctx: { db, headers }, input }) => {
    const cookieStore = cookies();
    const emailVerificationToken = cookieStore.get("email-verification-token")
      ?.value;
    if (!emailVerificationToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to perform code verifications.",
      });
    }

    const tokenUserId = verifyEmailVerificationJwt(emailVerificationToken);
    if (!tokenUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email verification token.",
      });
    }

    const rateLimitKey = `verify_ratelimit[${tokenUserId}]`;
    const rateLimit = await kv.get(rateLimitKey) as number | null;
    if (rateLimit) {
      const currentTimestamp = Date.now();
      const timeDiff = (currentTimestamp - rateLimit) / 1000;
      if (timeDiff < 5) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are being rate limited",
        });
      }
    }

    await kv.set(rateLimitKey, Date.now());

    const emailVerificationCode = await db.emailVerification.findFirst({
      where: {
        userId: input.userId,
        code: input.code,
        alreadyUsed: false,
      },
    });
    if (!emailVerificationCode) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid code.",
      });
    }

    if (emailVerificationCode.userId !== tokenUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User mismatch.",
      });
    }

    const now = Date.now();
    const codeExpiration = emailVerificationCode.expiresOn.getTime();
    if (now > codeExpiration) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Code expired." });
    }

    if (input.verifySeshId) {
      const modifiedSesh = await db.userSession.update({
        where: {
          id: input.verifySeshId,
        },
        data: {
          requiresVerificaiton: false,
          numOfIpChanges: 0,
        },
      });
      if (!modifiedSesh) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This session does not exist.",
        });
      }

      return {
        sessionVerified: input.verifySeshId,
        modifiedSesh,
      };
    }

    await db.emailVerification.updateMany({
      where: {
        userId: emailVerificationCode.userId,
      },
      data: {
        alreadyUsed: true,
      },
    });

    const keypair = generateKeyPair();

    const sessionToken = uuidv4();
    const signedSessionToken = createSignedString(sessionToken, keypair);

    const authToken = `${sessionToken}:${signedSessionToken.signature}`;
    const sessionExpiration = new Date(Date.now() + 6 * 60 * 60 * 1000);

    const userIp = headers.get("x-forwarded-for");
    const userIpHash = userIp ? await argon2.hash(userIp) : null;
    const newSession = await db.userSession.create({
      data: {
        sessionToken,
        publicVerificationToken: keypair.publicKey,
        userId: input.userId,
        expiresOn: sessionExpiration,
        currentIPHash: userIpHash,
      },
    });

    const cookieVerificationToken = createCookieVerification("auth-token");

    await db.emailVerification.update({
      where: {
        id: emailVerificationCode.id,
      },
      data: {
        alreadyUsed: true,
      },
    });

    return {
      newSession,
      cookieVerificationToken,
      authToken,
    };
  }),
  resendVerificationCode: publicProcedure.mutation(
    async ({ ctx: { headers } }) => {
      const userIp = headers.get("x-forwarded-for");
      const { block, timeDiffInSeconds } = await verifyUserIp(userIp);
      if (block) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are being rate limited${
            timeDiffInSeconds
              ? `, please wait ${timeDiffInSeconds} ${
                timeDiffInSeconds > 1 ? "seconds" : "second"
              } and try again.`
              : "."
          }`,
        });
      }

      const cookieStore = cookies();
      const emailVerificationToken = cookieStore.get("email-verification-token")
        ?.value;
      if (!emailVerificationToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      }

      const tokenUserId = verifyEmailVerificationJwt(emailVerificationToken);
      if (!tokenUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email verification token.",
        });
      }

      const emailData = await sendVerificationEmail({ userId: tokenUserId });
      if (emailData.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: emailData.errorMessage ?? "Failed to send email",
        });
      }

      await rateLimitUserIp(userIp);

      return {
        success: true,
      };
    },
  ),
  logout: privateProcedure.mutation(async ({ ctx: { db, userSession } }) => {
    const deletedSession = await db.userSession.delete({
      where: {
        id: userSession.id,
      },
      include: {
        user: true,
      },
    });
    if (!deletedSession) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No session was found.",
      });
    }

    return deletedSession;
  }),
});
