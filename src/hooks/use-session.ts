import { useRouter } from "next/navigation";
import { api } from "~/trpc/react"

interface Props {
  enforceAdmin?: boolean;
}

export const useSession = (props?: Props) => {
  const router = useRouter();

  const data = api.account.getCurrentSession.useQuery(undefined, {
    onSuccess: (data) => {
      if (props?.enforceAdmin && data.user.role !== 'ADMIN') {
        router.push("/account")
      }
    },
    onError: (error) => {
      if (error?.data?.code === "FORBIDDEN") {
        const sessionId = error?.message?.split(":")[0];
        const userId = error?.message?.split(":")[1];
        const cookieVerificationToken = error?.message?.split(":")[2];
        const emailVerificationToken = error?.message?.split(":")[3];
        if (
          !sessionId || !userId || !cookieVerificationToken ||
          !emailVerificationToken
        ) {
          router.push("/account/login");
        }

        router.push(
          `/account/set-email-verification-cookie?cookieVerificationToken=${cookieVerificationToken}&emailVerificationToken=${emailVerificationToken}&redirectTo=/account/verify/${userId}?verifySesh=${sessionId}`,
        );
      }

      router.push("/account/login");
    }
  })

  return data;
}
