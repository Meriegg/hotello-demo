import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export const createEmailVerificationJwt = (userId: string) => {
  const token = jwt.sign({ userId }, env.SECRET_KEY, {
    expiresIn: "30min",
  });

  return token;
};

export const verifyEmailVerificationJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      userId: string;
      exp: number;
    } | null;
    if (!decoded?.userId) {
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
