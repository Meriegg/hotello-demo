"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface Props {
  userId: string;
  verifySeshId?: string | null;
}

export const VerifyCodeForm = ({ userId, verifySeshId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const verifyCodeMutation = api.account.verifyCode.useMutation({
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: (data) => {
      if (data.cookieVerificationToken) {
        fetch("/api/setcookie", {
          method: "POST",
          body: JSON.stringify({
            key: "auth-token",
            value: data.authToken,
            verificationKey: data.cookieVerificationToken,
            args: {
              secure: false,
              httpOnly: true,
              maxAge: 60 * 60 * 6,
            },
          }),
        })
          .then(() => {
            router.push("/account");
          })
          .catch(() => {
            toast({
              variant: "destructive",
              title: "An error happened",
              description:
                "An error happened while logging you in, please try again and check your internet connection.",
            });
          });
        return;
      }

      router.push("/account");
    },
  });

  const beginCountdown = () => {
    setResendDisabled(true);

    const countdownInterval = setInterval(() => {
      setResendCountdown((prev) => (prev ?? 30) - 1);
    }, 1000);

    countdownIntervalRef.current = countdownInterval;
  };

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  const [isResendDisabled, setResendDisabled] = useState(false);
  const resendCodeMutation = api.account.resendVerificationCode.useMutation({
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message ?? "An error happened, please try again.",
      });
    },
    onSuccess: () => {
      toast({
        title: "Email sent!",
        description: "Your email was resent successfully.",
      });

      beginCountdown();
    },
  });

  useEffect(() => {
    if (resendCountdown === 0 && countdownIntervalRef.current) {
      setResendDisabled(false);
      setResendCountdown(null);
      clearInterval(countdownIntervalRef.current);
    }
  }, [resendCountdown]);

  const submit = () => {
    const { success } = z
      .string()
      .min(6)
      .max(6)
      .regex(/[0-9]/g)
      .safeParse(code);
    if (!success) {
      setError("Invalid code.");
      return;
    }

    verifyCodeMutation.mutate({ userId, code, verifySeshId });
  };

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="mt-4 flex w-full flex-col gap-2">
        <Input
          label="6 digit code"
          disabled={verifyCodeMutation.isLoading}
          value={code}
          error={error}
          onChange={(e) => {
            setError(null);
            setCode(e.target.value);
          }}
          className="w-full rounded-b-md rounded-t-2xl disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
        />
        <Button
          onClick={() => submit()}
          className="flex transform items-center gap-2 rounded-b-2xl rounded-t-md bg-neutral-100 font-bold text-neutral-900 ring-neutral-100 transition-all duration-300 hover:bg-neutral-200 active:ring-4"
          disabled={verifyCodeMutation.isLoading}
        >
          {verifyCodeMutation.isLoading && (
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              loaderClassName="p-0 w-fit"
            />
          )}
          Verify <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex w-full items-center justify-between">
        <button className="text-xs text-neutral-900 hover:underline">
          Change email
        </button>
        <button
          disabled={isResendDisabled || resendCodeMutation.isLoading}
          onClick={() => resendCodeMutation.mutate()}
          className="text-xs text-neutral-900 hover:underline disabled:opacity-70"
        >
          {(isResendDisabled && resendCountdown)
            ? `Wait ${resendCountdown} ${
              resendCountdown > 1 ? "seconds" : "second"
            }`
            : "Resend code"}
        </button>
      </div>
    </div>
  );
};
