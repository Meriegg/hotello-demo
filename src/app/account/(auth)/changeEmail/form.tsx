"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";

interface Props {
  verificationToken: string;
}

export const ChangeEmailForm = ({ verificationToken }: Props) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const changeEmail = api.account.modifyEmail.useMutation({
    onSuccess: () => {
      router.push("/account/dashboard");
    },
    onError: (error) => {
      setError(error?.message ?? "Unable to change email");
    },
    onMutate: () => {
      setError(null);
    },
  });

  const submit = () => {
    const { success } = z.string().email().safeParse(email);
    if (!success) {
      setError("Invalid email.");
      return;
    }

    changeEmail.mutate({ verificationToken, newEmail: email });
  };

  return (
    <div
      className="mx-auto flex w-full flex-col items-center gap-2 px-2 pt-12"
      style={{ width: "min(450px, 100%)" }}
    >
      <p className="text-center text-2xl text-neutral-900">Change your email</p>
      <p className="text-sm text-neutral-700">
        please enter your email to continue
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <Input
          label="Your email"
          disabled={changeEmail.isLoading}
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
          disabled={changeEmail.isLoading}
        >
          {changeEmail.isLoading && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
            />
          )}
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
