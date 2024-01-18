import { redirect } from "next/navigation";
import { getSession } from "../utils/get-page-session";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { AdminNavbar } from "./components/admin-navbar";
import { PathDisplay } from "./components/path-display";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (session.user.role !== "ADMIN") {
    redirect("/account/dashboard");
  }

  return (
    <MaxWidthContainer>
      <AdminNavbar />
      <PathDisplay />
      {children}
    </MaxWidthContainer>
  );
};

export default AdminLayout;
