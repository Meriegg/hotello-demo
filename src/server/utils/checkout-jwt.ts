import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export const createCheckoutJwt = (checkoutSessionToken: string) => {
  const token = jwt.sign({ checkoutSessionToken }, env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return token;
};

export const verifyCheckoutJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      checkoutSessionToken: string;
      exp: number;
    } | null;
    if (!decoded?.checkoutSessionToken) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.checkoutSessionToken;
  } catch (error) {
    console.error(error);
    return null;
  }
};
