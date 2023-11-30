import superjson from "superjson";
import argon2 from "argon2";
import { db } from "~/server/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import verifySignedString from "../utils/crypto/verify-signed-string";
import { sendVerificationEmail } from "../utils/auth/send-verification-email";

interface CreateContextOptions {
  headers: Headers;
  req: NextRequest;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    headers: opts.headers,
    req: opts.req,
    db,
  };
};

export const createTRPCContext = (
  opts: { req: NextRequest },
) => {
  return createInnerTRPCContext({
    headers: opts.req.headers,
    ...opts,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
      },
    };
  },
});

const isAuthed = t.middleware(async (opts) => {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  if (!authToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No session token provided.",
    });
  }

  const sessionToken = authToken.split(":")[0];
  const signature = authToken.split(":")[1];
  if (!sessionToken || !signature) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid auth token.",
    });
  }

  // Verify db session
  const dbSession = await opts.ctx.db.userSession.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!dbSession) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session does not exist.",
    });
  }

  if (dbSession.requiresVerificaiton) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `${dbSession.id}:${dbSession.userId}`,
    });
  }

  const userIp = opts.ctx.req.headers.get("x-forwarded-for");
  const isIpEqual = (userIp && dbSession.currentIPHash)
    ? await argon2.verify(dbSession.currentIPHash, userIp)
    : false;

  let currentIpChanges = dbSession.numOfIpChanges;
  if (!isIpEqual) {
    currentIpChanges += 1;
  }

  if (currentIpChanges >= 3) {
    await db.userSession.update({
      where: {
        id: dbSession.id,
      },
      data: {
        numOfIpChanges: currentIpChanges,
        requiresVerificaiton: true,
      },
    });

    const emailData = await sendVerificationEmail({ userId: dbSession.userId });
    if (emailData.error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to send email, please log in again.",
      });
    }

    throw new TRPCError({
      code: "FORBIDDEN",
      message: `${dbSession.id}:${dbSession.userId}`,
    });
  }

  if (currentIpChanges !== dbSession.numOfIpChanges) {
    const ipHash = userIp ? await argon2.hash(userIp) : null;

    await db.userSession.update({
      where: {
        id: dbSession.id,
      },
      data: {
        numOfIpChanges: currentIpChanges,
        currentIPHash: ipHash,
      },
    });
  }

  const now = Date.now();
  const sessionExpiration = dbSession.expiresOn.getTime();
  if (now > sessionExpiration) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired." });
  }

  // Verify signature
  const isSignatureValid = verifySignedString(
    sessionToken,
    signature,
    dbSession.publicVerificationToken,
  );
  if (!isSignatureValid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid auth token signature.",
    });
  }

  return opts.next({
    ctx: {
      ...opts,
      user: dbSession.user,
      userSession: dbSession,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
