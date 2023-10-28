import superjson from "superjson";
import { db } from "~/server/db";
import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { type NextRequest, type NextResponse } from "next/server";

interface CreateContextOptions {
  headers: Headers;
  req: NextRequest;
  res: NextResponse;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    headers: opts.headers,
    req: opts.req,
    res: opts.res,
    db,
  };
};

export const createTRPCContext = (opts: { req: NextRequest, res: NextResponse }) => {
  return createInnerTRPCContext({
    headers: opts.req.headers,
    req: opts.req,
    res: opts.res,
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

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
