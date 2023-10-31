import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export const createCartJwt = (productIds: string[]) => {
  const token = jwt.sign({ products: productIds }, env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return token;
};

export const extractFromCartJwt = (token: string) => {
  try {
    const decoded: any = jwt.verify(token, env.SECRET_KEY);
    if (!decoded || !decoded?.products || !Array.isArray(decoded?.products)) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.products as string[];
  } catch (error) {
    console.error(error);
    return null;
  }
};
