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
import { SignUpDataSchema } from "~/app/account/(auth)/sign-up/validation";
import { ChangeAccountDetailsSchema } from "~/lib/zod/account";
import {
  createEmailChangeJwt,
  verifyEmailChangeJwt,
} from "~/server/utils/email-change-jwt";
import { EmailChangeEmail } from "~/components/emails/email-change";
import { resend } from "~/lib/resend";
import { stripe } from "~/lib/stripe";

export const accountsRouter = createTRPCRouter({
  getCurrentSession: privateProcedure.query(
    ({ ctx: { userSession, user } }) => ({
      userSession,
      user,
    }),
  ),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx: { db, headers }, input }) => {
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
          message: "Failed to send email",
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
  signUp: publicProcedure
    .input(SignUpDataSchema)
    .mutation(async ({ ctx: { db, headers }, input }) => {
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

      console.log(input);
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            {
              email: input.email,
            },
            {
              phoneNum: !!input.phoneNum ? input.phoneNum : "INVALID_VALUE",
            },
          ],
        },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email or phone number is already taken.",
        });
      }

      const newUser = await db.user.create({
        data: {
          ...input,
        },
      });

      const emailData = await sendVerificationEmail({ userId: newUser.id });
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
      const emailVerificationToken = createEmailVerificationJwt(newUser.id);

      return {
        redirectTo: `/account/verify/${newUser.id}`,
        emailVerificationToken,
        cookieVerificationToken,
      };
    }),
  verifyCode: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        code: z.string(),
        verifySeshId: z.string().nullish().optional(),
      }),
    )
    .mutation(async ({ ctx: { db, headers }, input }) => {
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

      if (tokenUserId !== input.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token UID mismatch.",
        });
      }

      const dbUser = await db.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This user does not exist.",
        });
      }

      const rateLimitKey = `verify_ratelimit[${tokenUserId}]`;
      const rateLimit: number | null = await kv.get(rateLimitKey);
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

      if (dbUser.isNewUser) {
        await db.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            isNewUser: false,
          },
        });
      }

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
  changeEmail: publicProcedure.mutation(async ({ ctx: { db } }) => {
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

    const dbUser = await db.user.findUnique({
      where: {
        id: tokenUserId,
      },
    });
    if (!dbUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "This user does not exist",
      });
    }

    await db.emailVerification.updateMany({
      where: {
        userId: tokenUserId,
      },
      data: {
        alreadyUsed: true,
      },
    });

    if (dbUser.isNewUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You can't change your email on sign uptDda ",
      });
    }

    return {
      redirectTo: "/account/login",
    };
  }),
  logout: privateProcedure
    .input(z.object({ allDevices: z.boolean().optional() }).optional())
    .mutation(async ({ ctx: { db, userSession }, input }) => {
      if (input?.allDevices) {
        const deletedSessions = await db.userSession.deleteMany({
          where: {
            userId: userSession.userId,
          },
        });

        return {
          deletedSessions,
        };
      }

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
  changeAccountDetails: privateProcedure
    .input(ChangeAccountDetailsSchema)
    .mutation(async ({ ctx: { db, userSession }, input }) => {
      const editedAccount = await db.user.update({
        where: {
          id: userSession.userId,
        },
        data: {
          ...input,
        },
      });

      return editedAccount;
    }),
  requestEmailChange: privateProcedure.mutation(async ({ ctx: { user } }) => {
    const token = createEmailChangeJwt(user.id);
    const link = `http://localhost:3000/account/changeEmail?token=${token}`;

    const emailData = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["delivered@resend.dev", user.email],
      subject: "Hotello email change",
      react: EmailChangeEmail({ token }),
      text: `Your hotello email change link is: ${link}`,
    });
    if (emailData.error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to send email.",
      });
    }

    return user.id;
  }),
  modifyEmail: privateProcedure
    .input(
      z.object({ verificationToken: z.string(), newEmail: z.string().email() }),
    )
    .mutation(
      async ({ input: { newEmail, verificationToken }, ctx: { user, db } }) => {
        const tokenUserId = verifyEmailChangeJwt(verificationToken);
        if (!tokenUserId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid verification token.",
          });
        }

        if (tokenUserId !== user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to perform this action.",
          });
        }

        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            email: newEmail,
          },
        });

        return {
          success: true,
        };
      },
    ),
  getUserBookings: privateProcedure.query(
    async ({ ctx: { db, userSession } }) => {
      const bookings = await db.booking.findMany({
        where: {
          userId: userSession.userId,
        },
        include: {
          rooms: {
            include: {
              guestDetails: true,
              room: true,
            },
          },
        },
      });

      const finalBookings = [];

      for (const booking of bookings) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.paymentIntentId,
        );

        finalBookings.push({ ...booking, totalPaid: paymentIntent.amount });
      }

      return finalBookings;
    },
  ),
  cancelBooking: privateProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx: { db, userSession }, input: { bookingId } }) => {
      const booking = await db.booking.findUnique({
        where: {
          id: bookingId,
          userId: userSession.user.id,
        },
      });
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking does not exist.",
        });
      }

      if (booking.paymentType === "FULL_UPFRONT") {
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });

        await db.booking.update({
          where: {
            id: booking.id,
          },
          data: {
            stripeRefundId: refund.id,
            canceled: true,
            canceledById: userSession.user.id,
          },
        });

        return {
          success: true,
          refunded: true,
        };
      }

      await db.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          canceled: true,
          canceledById: userSession.user.id,
        },
      });

      return {
        success: true,
      };
    }),
});
