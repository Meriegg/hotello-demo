import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export const createCookieVerification = (key: string) => {
  const cookieVerificationToken = jwt.sign(
    { cookieName: key },
    env.SECRET_KEY,
    {
      expiresIn: "1 min",
    },
  );

  return cookieVerificationToken;
};
