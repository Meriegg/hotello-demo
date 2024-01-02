"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export const SecurityOptions = () => {
  const { toast } = useToast();
  const [changeEmailSuccess, setChangeEmailSuccess] = useState(false);

  const router = useRouter();

  const requestEmailChange = api.account.requestEmailChange.useMutation({
    onSuccess: () => {
      setChangeEmailSuccess(true);

      setTimeout(() => {
        setChangeEmailSuccess(false);
      }, 2000);
    },
  });

  const logout = api.account.logout.useMutation({
    onSuccess: () => {
      router.push("/account/login");
    },
    onError: (error) => {
      setChangeEmailSuccess(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message ?? "Failed to send email.",
      });
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {changeEmailSuccess && (
        <p className="py-3 w-fit rounded-md px-6 bg-green-500/10 border-[1px] border-green-900/50  text-xs font-bold text-green-900">
          A link was sent to your email
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => requestEmailChange.mutate()}
          disabled={requestEmailChange.isLoading}
          className="text-sm rounded-l-xl rounded-r-md text-neutral-700 px-4 py-2 border-[1px] border-neutral-100 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-300 disabled:opacity-70 disabled:bg-neutral-100 flex items-center gap-2"
        >
          Change Email {requestEmailChange.isLoading && (
            <Loader
              label={null}
              loaderClassName="p-0 w-fit"
              containerClassName="p-0 w-fit"
            />
          )}
        </button>

        <button
          disabled={logout.isLoading}
          onClick={() => logout.mutate({ allDevices: true })}
          className="text-sm flex items-center gap-2 rounded-r-xl rounded-l-md text-neutral-700 px-4 py-2 border-[1px] border-neutral-100 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-300 disabled:opacity-70 disabled:bg-neutral-100"
        >
          Log out of all devices {logout.isLoading && (
            <Loader
              label={null}
              loaderClassName="p-0 w-fit"
              containerClassName="p-0 w-fit"
            />
          )}
        </button>
      </div>
    </div>
  );
};
