"use client";

import { ChangeAccountDetails } from "../components/change-account-details";
import { SecurityOptions } from "../components/security-options";
import { useSession } from "~/hooks/use-session";
import { Loader } from "~/components/ui/loader";

const Page = () => {
  const { data: currentSession, ...currentSessionInfo } = useSession();

  if (currentSessionInfo.isLoading) {
    return <Loader label="Fetching account data" />
  }

  if (currentSessionInfo.isError || !currentSession) {
    return <p className="text-neutral-700 text-xs text-center w-full">You are not logged in.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Hello, {currentSession.user.firstName}!
      </h1>

      <div className="mb-1 mt-3 flex items-center gap-2">
        <p className="text-neutral-200">•</p>
        <p className="text-sm text-neutral-700">Manage account details</p>
      </div>
      <ChangeAccountDetails user={currentSession.user} />

      <div className="mb-1 mt-3 flex items-center gap-2">
        <p className="text-neutral-200">•</p>
        <p className="text-sm text-neutral-700">Security</p>
      </div>
      <SecurityOptions />
    </div>
  );
};

export default Page;
