"use client";

import { cn } from "~/lib/utils";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";

interface Props {
  className?: string;
}

export const LogoutBtn = ({ className }: Props) => {
  const router = useRouter();
  const logoutMutation = api.account.logout.useMutation({
    onSuccess: () => {
      router.push("/account/login");
    },
  });

  return (
    <Button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isLoading}
      className={cn("gap-2 text-white", className)}
    >
      Log out {logoutMutation.isLoading
        ? (
          <Loader
            containerClassName="p-0 w-fit"
            loaderClassName="p-0 w-fit text-white"
            label={null}
          />
        )
        : <LogOutIcon className="w-4 h-4" />}
    </Button>
  );
};
