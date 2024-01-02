"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const currentSession = api.account.getCurrentSession.useQuery(undefined, {
    onSuccess: () => {
      router.push("/account");
    },
    retry: 0,
  });

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const loginMutation = api.account.login.useMutation({
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: (data) => {
      setIsRedirecting(true);

      fetch("/api/setcookie", {
        method: "POST",
        body: JSON.stringify({
          key: "email-verification-token",
          value: data.emailVerificationToken,
          verificationKey: data.cookieVerificationToken,
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
            return;
          }

          const redirect = searchParams.get("redirect");
          router.push(
            `${data.redirectTo}${redirect ? `?redirect=${redirect}` : ""}`,
          );
        });
    },
  });

  const submit = () => {
    const { success } = z.string().email().safeParse(email);
    if (!success) {
      setError("Invalid email.");
      return;
    }

    loginMutation.mutate({
      email,
    });
  };

  if (currentSession.isLoading) {
    return <Loader label="Checking auth status" />;
  }

  return (
    <div
      className="w-full flex flex-col items-center pt-12 gap-2 mx-auto px-2"
      style={{ width: "min(450px, 100%)" }}
    >
      <p className="text-2xl text-neutral-900 text-center">
        Log into your account
      </p>
      <p className="text-neutral-700 text-sm">
        please enter your email to continue
      </p>

      <div className="flex flex-col gap-2 w-full mt-4">
        <Input
          label="Your email"
          disabled={loginMutation.isLoading || isRedirecting}
          value={email}
          error={error}
          onChange={(e) => {
            setError(null);
            setEmail(e.target.value);
          }}
          className="w-full disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 rounded-t-2xl rounded-b-md"
        />
        <Button
          onClick={() => submit()}
          className="flex items-center gap-2 bg-neutral-100 rounded-b-2xl rounded-t-md text-neutral-900 hover:bg-neutral-200 active:ring-4 ring-neutral-100 transition-all duration-300 transform font-bold"
          disabled={loginMutation.isLoading || isRedirecting}
        >
          {(loginMutation.isLoading || isRedirecting) && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
            />
          )}
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center w-full justify-between">
        <Link
          href="/account/email-issues"
          className="text-xs text-neutral-900 hover:underline"
        >
          Email issues
        </Link>
        <Link
          href="/account/sign-up"
          className="text-xs text-neutral-900 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Page;
