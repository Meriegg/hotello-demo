import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { LogoutBtn } from "./components/logout-btn";

const Page = async () => {
  const currentSession = await api.account.getCurrentSession.query().catch(
    (error) => {
      if (error?.data?.code === "FORBIDDEN") {
        const sessionId = error?.message?.split(":")[0];
        const userId = error?.message?.split(":")[1];
        if (!sessionId || !userId) {
          redirect("/account/login");
        }

        redirect(`/account/verify/${userId}?verifySesh=${sessionId}`);
      }

      redirect("/account/login");
    },
  );

  return (
    <div>
      <p>Account page</p>
      <LogoutBtn />
    </div>
  );
};

export default Page;
