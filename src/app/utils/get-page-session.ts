import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const getSession = async () => {
  const currentSession = await api.account.getCurrentSession
    .query()
    .catch(async (error: { message?: string; data?: { code?: string } }) => {
      if (error?.data?.code === "FORBIDDEN") {
        const sessionId = error?.message?.split(":")[0];
        const userId = error?.message?.split(":")[1];
        const cookieVerificationToken = error?.message?.split(":")[2];
        const emailVerificationToken = error?.message?.split(":")[3];
        if (
          !sessionId || !userId || !cookieVerificationToken ||
          !emailVerificationToken
        ) {
          redirect("/account/login");
        }

        redirect(
          `/account/set-email-verification-cookie?cookieVerificationToken=${cookieVerificationToken}&emailVerificationToken=${emailVerificationToken}&redirectTo=/account/verify/${userId}?verifySesh=${sessionId}`,
        );
      }

      redirect("/account/login");
    });

  return currentSession;
};
