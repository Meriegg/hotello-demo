import superjson from "superjson";
import { db } from "~/server/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { type NextRequest } from "next/server";
import { getUserSession } from "../utils/get-user-session";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

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
  const { error, code, message, userSession } = await getUserSession(
    opts.ctx.headers,
  );
  if (error ?? !userSession) {
    throw new TRPCError({
      code: code as TRPC_ERROR_CODE_KEY,
      message: message,
    });
  }

  return opts.next({
    ctx: {
      ...opts,
      user: userSession.user,
      userSession,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
