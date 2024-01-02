// This sets cookies to the client because I could not figure out how to set cookies
// with tRPC in the new router.

import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "~/env.mjs";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: NextRequest) => {
  try {
    const BodyValidator = z.object({
      key: z.string(),
      value: z.string(),
      verificationKey: z.string(),
      args: z.object({
        secure: z.boolean().optional(),
        httpOnly: z.boolean().optional(),
        maxAge: z.number(),
      }),
    });

    const reqBody = await request.json() as z.infer<typeof BodyValidator>;

    const body = BodyValidator.parse(reqBody);

    const decoded = jwt.verify(body.verificationKey, env.SECRET_KEY) as {
      exp: number;
      cookieName: string;
    } | null;
    if (!decoded?.exp || !decoded?.cookieName) {
      return Response.error();
    }

    if (Date.now() >= decoded.exp * 1000) {
      return Response.error();
    }

    if (decoded.cookieName !== body.key) {
      return Response.error();
    }

    const cookieStore = cookies();

    cookieStore.set(body.key, body.value, {
      secure: body.args.secure,
      httpOnly: body.args.httpOnly,
      maxAge: body.args.maxAge,
      sameSite: true,
    });

    return Response.json({ message: "OK" });
  } catch (error) {
    console.error(error);
    return Response.error();
  }
};
