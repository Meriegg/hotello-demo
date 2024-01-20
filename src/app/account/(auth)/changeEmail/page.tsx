import { notFound } from "next/navigation";
import { verifyEmailChangeJwt } from "~/server/utils/email-change-jwt";
import { getSession } from "~/app/utils/get-page-session";
import { ChangeEmailForm } from "./form";

const Page = async ({
  searchParams: { token: verificationToken },
}: {
  searchParams: { token?: string | null };
}) => {
  if (!verificationToken) {
    return notFound();
  }

  const currentSession = await getSession();

  const tokenUserId = verifyEmailChangeJwt(verificationToken);
  if (!tokenUserId) {
    return notFound();
  }

  if (tokenUserId !== currentSession.user.id) {
    return notFound();
  }

  return <ChangeEmailForm verificationToken={verificationToken} />;
};

export default Page;
