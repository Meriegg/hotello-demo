import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (request: NextRequest) => {
  const BodyValidator = z.object({
    cookieName: z.string(),
  });

  const body = await request.json();
  const data = BodyValidator.parse(body);
  const cookieStore = cookies();

  cookieStore.delete(data.cookieName);

  return NextResponse.json({ ok: true });
};
