"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface Props {
  verificationToken: string;
}

export const ChangeEmailForm = ({ verificationToken }: Props) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
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
      className="w-full flex flex-col items-center pt-12 gap-2 mx-auto px-2"
      style={{ width: "min(450px, 100%)" }}
    >
      <p className="text-2xl text-neutral-900 text-center">
        Change your email
      </p>
      <p className="text-neutral-700 text-sm">
        please enter your email to continue
      </p>

      <div className="flex flex-col gap-2 w-full mt-4">
        <Input
          label="Your email"
          disabled={changeEmail.isLoading}
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
          disabled={changeEmail.isLoading}
        >
          {changeEmail.isLoading && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
            />
          )}
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
