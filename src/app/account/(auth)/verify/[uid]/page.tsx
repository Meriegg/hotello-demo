import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { VerifyCodeForm } from "./verify-form";
import { cookies } from "next/headers";
import { verifyEmailVerificationJwt } from "~/server/utils/auth/verification-jwt";

const Page = async (
  { params: { uid }, searchParams: { verifySesh } }: {
    params: { uid: string };
    searchParams: { verifySesh?: string | null };
  },
) => {
  const cookieStore = cookies();
  const emailVerificationToken = cookieStore.get("email-verification-token")
    ?.value;
  if (!emailVerificationToken) {
    return notFound();
  }

  const tokenUserId = verifyEmailVerificationJwt(emailVerificationToken);
  if (!tokenUserId) {
    return notFound();
  }

  const user = await db.user.findUnique({ where: { id: uid } });
  if (!user) {
    return notFound();
  }

  if (tokenUserId !== user.id) {
    return notFound();
  }

  const session = verifySesh
    ? await db.userSession.findUnique({
      where: { id: verifySesh },
    })
    : null;
  if (!session && verifySesh) {
    return notFound();
  }

  if ((session && verifySesh) && session.userId !== user.id) {
    return notFound();
  }

  return (
    <div
      className="mx-auto flex flex-col gap-2 mt-12"
      style={{ width: "min(450px, 100%)" }}
    >
      {verifySesh && (
        <p className="text-xs text-neutral-700 font-bold bg-neutral-50 border-[1px] border-neutral-100 rounded-lg py-3 px-2 w-full text-center mb-2">
          Your IP address changed more than 3 times while you were logged in.
        </p>
      )}
      <h1 className="text-neutral-900 text-2xl text-center w-full">
        {verifySesh ? "Verify suspicious activity" : "Verify your email"}
      </h1>
      <p className="text-sm text-neutral-700 w-full text-center">
        An email was sent to{" "}
        <span className="font-bold text-neutral-900">{user.email}</span>
      </p>

      <VerifyCodeForm userId={user.id} verifySeshId={verifySesh} />
    </div>
  );
};

export default Page;
