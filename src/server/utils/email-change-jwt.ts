import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export const createEmailChangeJwt = (userId: string) => {
  const token = jwt.sign({ emailChange: true, userId }, env.SECRET_KEY, {
    expiresIn: "12h",
  });

  return token;
};

export const verifyEmailChangeJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      emailChange: boolean;
      userId: string;
      exp: number;
    } | null;
    if (!decoded?.userId || !decoded?.emailChange) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
};
