import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSession } from "~/server/utils/get-user-session";

export const getSession = async () => {
  const { message, code, userSession } = await getUserSession(headers());
  if (code === "FORBIDDEN") {
    const sessionId = message?.split(":")[0];
    const userId = message?.split(":")[1];
    const cookieVerificationToken = message?.split(":")[2];
    const emailVerificationToken = message?.split(":")[3];
    if (
      !sessionId ||
      !userId ||
      !cookieVerificationToken ||
      !emailVerificationToken
    ) {
      redirect("/account/login");
    }

    redirect(
      `/account/set-email-verification-cookie?cookieVerificationToken=${cookieVerificationToken}&emailVerificationToken=${emailVerificationToken}&redirectTo=/account/verify/${userId}?verifySesh=${sessionId}`,
    );
  }

  if (!userSession) redirect("/account/login");

  return userSession;
};
