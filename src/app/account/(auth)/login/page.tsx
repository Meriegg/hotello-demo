"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { env } from "~/env.mjs";
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
            secure: process.env.NODE_ENV === "production" ? true : false,
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

          const redirect = searchParams?.get("redirect");
          const redirectParam = redirect ? `?redirect=${redirect}` : "";
          router.push(`${data.redirectTo}${redirectParam}`);
        })
        .catch((e) => console.error(e));
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
      className="mx-auto flex w-full flex-col items-center gap-2 px-2 pt-12"
      style={{ width: "min(450px, 100%)" }}
    >
      <p className="text-center text-2xl text-neutral-900">
        Log into your account
      </p>
      <p className="text-sm text-neutral-700">
        please enter your email to continue
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <Input
          label="Your email"
          disabled={loginMutation.isLoading || isRedirecting}
          value={email}
          error={error}
          onChange={(e) => {
            setError(null);
            setEmail(e.target.value);
          }}
          className="w-full rounded-b-md rounded-t-2xl disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
        />
        <Button
          onClick={() => submit()}
          className="flex transform items-center gap-2 rounded-b-2xl rounded-t-md bg-neutral-100 font-bold text-neutral-900 ring-neutral-100 transition-all duration-300 hover:bg-neutral-200 active:ring-4"
          disabled={loginMutation.isLoading || isRedirecting}
        >
          {(loginMutation.isLoading || isRedirecting) && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
            />
          )}
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex w-full items-center justify-between">
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
