"use client";

import Link from "next/link";
import { LayoutDashboard, ListIcon, UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { LogoutBtn } from "./logout-btn";
import { api } from "~/trpc/react";

export const DashboardNav = () => {
  const { isLoading, isError, data } = api.account.getCurrentSession.useQuery();

  const pathname = usePathname();

  const routes = [
    {
      text: "Account",
      icon: <UserIcon className="text-inherit w-3 h-3" />,
      href: "/account/dashboard",
    },
    {
      text: "Bookings",
      icon: <ListIcon className="text-inherit w-3 h-3" />,
      href: "/account/dashboard/bookings",
    },
  ];

  return (
    <div className="flex flex-row md:flex-col md:max-w-[160px] gap-2 w-full flex-wrap">
      {routes.map((route, i) => (
        <Link
          key={i}
          href={route.href}
          className={cn(
            "text-neutral-700 justify-center flex items-center gap-2 text-sm w-full py-4 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 border-[1px] md:border-l-0 border-neutral-100 md:rounded-r-[8px] md:rounded-l-[0px] rounded-[8px]",
            pathname === route.href && "bg-neutral-50 text-neutral-900",
            i === 0 && "md:rounded-tr-[16px]",
          )}
        >
          {route.icon} {route.text}
        </Link>
      ))}

      {(!isLoading && !isError && data.user.role === "ADMIN") && (
        <Link
          href="/admin"
          className="text-neutral-700 justify-center flex items-center gap-2 text-sm w-full py-4 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 border-[1px] md:border-l-0 border-neutral-100 md:rounded-r-[8px] md:rounded-l-[0px] rounded-[8px]"
        >
          <LayoutDashboard className="w-3 h-3 text-inherit" /> Admin
        </Link>
      )}

      <LogoutBtn className="w-full md:rounded-br-[16px] md:rounded-l-[0px] md:rounded-tr-[8px] rounded-[8px] text-sm py-4" />
    </div>
  );
};
