import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const getSession = async () => {
  const currentSession = await api.account.getCurrentSession
    .query()
    .catch((error: { message?: string; data?: { code?: string } }) => {
      if (error?.data?.code === "FORBIDDEN") {
        const sessionId = error?.message?.split(":")[0];
        const userId = error?.message?.split(":")[1];
        if (!sessionId || !userId) {
          redirect("/account/login");
        }

        redirect(`/account/verify/${userId}?verifySesh=${sessionId}`);
      }

      redirect("/account/login");
    });

  return currentSession
}