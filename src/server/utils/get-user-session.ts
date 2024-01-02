import * as argon2 from "argon2";
import { cookies } from "next/headers";
import { db } from "../db";
import { sendVerificationEmail } from "./auth/send-verification-email";
import verifySignedString from "./crypto/verify-signed-string";

export const getUserSession = async (headers: Headers) => {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  if (!authToken) {
    return {
      error: true,
      code: "UNAUTHORIZED",
      message: "No session token provided.",
    };
  }

  const sessionToken = authToken.split(":")[0];
  const signature = authToken.split(":")[1];
  if (!sessionToken || !signature) {
    return {
      error: true,
      code: "UNAUTHORIZED",
      message: "Invalid auth token.",
    };
  }

  // Verify db session
  const dbSession = await db.userSession.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!dbSession) {
    return {
      error: true,
      code: "UNAUTHORIZED",
      message: "Session does not exist.",
    };
  }

  if (dbSession.requiresVerificaiton) {
    return {
      error: true,
      code: "FORBIDDEN",
      message: `${dbSession.id}:${dbSession.userId}`,
    };
  }

  const userIp = headers.get("x-forwarded-for");
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
      return {
        error: true,
        code: "UNAUTHORIZED",
        message: "Failed to send email, please log in again.",
      };
    }

    return {
      error: true,
      code: "FORBIDDEN",
      message: `${dbSession.id}:${dbSession.userId}`,
    };
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
    return {
      error: true,
      code: "UNAUTHORIZED",
      message: "Session expired.",
    };
  }

  // Verify signature
  const isSignatureValid = verifySignedString(
    sessionToken,
    signature,
    dbSession.publicVerificationToken,
  );
  if (!isSignatureValid) {
    return {
      error: true,
      code: "UNAUTHORIZED",
      message: "Invalid auth token signature.",
    };
  }

  return {
    userSession: dbSession,
  };
};
