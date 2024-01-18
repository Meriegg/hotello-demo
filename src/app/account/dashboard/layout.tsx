import { DashboardNav } from "../components/dashboard-nav";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthContainer className="border-l-[1px] border-neutral-100 min-h-full pt-6 flex md:flex-row flex-col items-start justify-start gap-8 px-4 md:px-0">
      <DashboardNav />
      <div className="flex-1">
        {children}
      </div>
    </MaxWidthContainer>
  );
};

export default Layout;
