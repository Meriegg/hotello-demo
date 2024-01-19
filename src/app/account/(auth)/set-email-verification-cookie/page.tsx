"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";

const Page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  fetch("/api/setcookie", {
    method: "POST",
    body: JSON.stringify({
      key: "email-verification-token",
      value: searchParams?.get("emailVerificationToken"),
      verificationKey: searchParams?.get("cookieVerificationToken"),
      args: {
        secure: false,
        httpOnly: true,
        maxAge: 60 * 30,
      },
    }),
  })
    .then((res) => {
      if (res.status === 500) {
        toast({
          variant: "destructive",
          title: "An error happened",
          description:
            "An error happened while logging you in, please try again and check your internet connection.",
        });

        router.push("/account/dashboard");
        return;
      }

      router.push(searchParams?.get("redirectTo") ?? "/account/dashboard");
    }).catch((e) => console.error(e));

  return <Loader label="Just a moment" />;
};

export default Page;
