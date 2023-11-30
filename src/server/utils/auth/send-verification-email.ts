import { db } from "~/server/db";
import { createEmailVerificationCode } from "../create-email-verification";
import { resend } from "~/lib/resend";
import { VerificationCode } from "~/components/emails/verification-code";

export const sendVerificationEmail = async (
  { userId, createDbCode = true }: { userId: string; createDbCode?: boolean },
) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return {
      error: true,
      errorMessage: "User does not exist.",
    };
  }

  const code = createEmailVerificationCode();

  // @ts-ignore
  const emailData = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["delivered@resend.dev", user.email],
    subject: "Hotello verification code",
    react: VerificationCode({ code: code.codeStr }),
  });
  if (emailData.error) {
    return {
      error: true,
      errorMessage: "Error sending email, please try again later.",
    };
  }

  if (createDbCode) {
    const expirationDateTime = new Date(Date.now() + 15 * 60 * 1000);
    await db.emailVerification.create({
      data: {
        code: code.codeStr,
        userId: user.id,
        expiresOn: expirationDateTime,
      },
    });
  }

  return {
    emailData,
    code,
  };
};
