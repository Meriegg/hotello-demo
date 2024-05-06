"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { SignUpDataSchema } from "./validation";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Loader } from "~/components/ui/loader";
import { PhoneNumInput } from "~/components/ui/phoneinput";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { useState } from "react";
import { env } from "~/env.mjs";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSession = api.account.getCurrentSession.useQuery(undefined, {
    onSuccess: () => {
      router.push("/account");
    },
    retry: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const signUpMutation = api.account.signUp.useMutation({
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
    onError: (error) => {
      setError(error?.message ?? "An error happened, please try again later.");
    },
    onMutate: () => {
      setError(null);
    },
  });

  type FormType = z.infer<typeof SignUpDataSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(SignUpDataSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNum: "",
      phoneNumCountry: null,
      age: undefined,
    },
  });

  if (currentSession.isLoading) {
    return <Loader label="Checking auth status" />;
  }

  return (
    <div
      className="mx-auto flex w-full flex-col items-center gap-2 px-2 pt-12"
      style={{ width: "min(450px, 100%)" }}
    >
      {error && (
        <p className="mt-2 w-full rounded-md border-[1px] border-red-400/50 bg-red-400/10 px-2 py-3 text-center text-sm font-bold text-red-900">
          {error}
        </p>
      )}

      <p className="text-center text-2xl text-neutral-900">
        Create a new account
      </p>
      <p className="text-sm text-neutral-700">
        please fill in the required details to continue
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            label="First Name"
            disabled={signUpMutation.isLoading || isRedirecting}
            error={form.formState.errors?.firstName?.message}
            className="w-full rounded-md rounded-tl-2xl disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
            {...form.register("firstName")}
          />
          <Input
            label="Last Name"
            disabled={signUpMutation.isLoading || isRedirecting}
            error={form.formState.errors?.lastName?.message}
            className="w-full rounded-md rounded-tr-2xl disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
            {...form.register("lastName")}
          />
        </div>
        <Input
          label="Your email"
          disabled={signUpMutation.isLoading || isRedirecting}
          error={form.formState.errors?.email?.message}
          className="w-full rounded-md disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
          {...form.register("email")}
        />

        <PhoneNumInput
          onChange={(value, country) => {
            form.setValue("phoneNum", value);
            form.setValue(
              "phoneNumCountry",
              (country as { countryCode?: string })?.countryCode ?? "",
            );
          }}
          inputClass="!rounded-md"
          buttonClass="!rounded-l-md"
          defaultCountry={form.watch("phoneNumCountry")}
          value={form.watch("phoneNum")}
          placeholder="Phone number (optional)"
        />

        <Input
          label="Age"
          type="number"
          pattern="[0-9]"
          disabled={signUpMutation.isLoading || isRedirecting}
          error={form.formState.errors?.age?.message}
          className="w-full rounded-md disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
          {...form.register("age", {
            valueAsNumber: true,
          })}
        />

        <Button
          onClick={() => {
            form.trigger().catch((e) => console.error(e));
            form
              .handleSubmit((data) => {
                signUpMutation.mutate({ ...data });
              })()
              .catch((e) => console.error(e));
          }}
          className="flex transform items-center gap-2 rounded-b-2xl rounded-t-md bg-neutral-100 font-bold text-neutral-900 ring-neutral-100 transition-all duration-300 hover:bg-neutral-200 active:ring-4"
          disabled={signUpMutation.isLoading || isRedirecting}
        >
          {(signUpMutation.isLoading || isRedirecting) && (
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
          href="/account/login"
          className="text-xs text-neutral-900 hover:underline"
        >
          Log in
        </Link>
      </div>
      <p className="mt-1 text-center text-xs text-neutral-700">
        By pressing “continue” you agree to our{" "}
        <Link href="/legal/terms" className="text-neutral-900 underline">
          Terms and Conditions
        </Link>{" "}
        and any other document present in our{" "}
        <Link className="text-neutral-900 underline" href="/legal">
          Legal
        </Link>{" "}
        page.
      </p>
    </div>
  );
};

export default Page;
