"use client";

import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { AdminNavbar } from "./components/admin-navbar";
import { PathDisplay } from "./components/path-display";
import { useSession } from "~/hooks/use-session";
import { Loader } from "~/components/ui/loader";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: currentSession, ...currentSessionInfo } = useSession({ enforceAdmin: true });

  if (currentSessionInfo.isLoading) {
    return <Loader label="Fetching account data" />
  }

  if (currentSessionInfo.isError || !currentSession) {
    return <p className="text-neutral-700 text-xs text-center w-full">You are not logged in.</p>
  }

  return (
    <MaxWidthContainer>
      <AdminNavbar />
      <PathDisplay />
      <div className="px-8 py-6 border-[1px] border-t-[0px] border-neutral-100">
        {children}
      </div>
    </MaxWidthContainer>
  );
};

export default AdminLayout;
