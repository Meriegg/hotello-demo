"use client";

import Link from "next/link";
import { ListIcon, UserIcon, UsersIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { LogoutBtn } from "./logout-btn";

export const DashboardNav = () => {
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
    {
      text: "Past Guests",
      icon: <UsersIcon className="text-inherit w-3 h-3" />,
      href: "/account/dashboard/pastGuests",
    },
  ];

  return (
    <div
      className="flex flex-col gap-2"
      style={{ width: "min(160px, 100%)" }}
    >
      {routes.map((route, i) => (
        <Link
          key={i}
          href={route.href}
          className={cn(
            "text-neutral-700 justify-center flex items-center gap-2 text-sm w-full py-4 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 border-[1px] border-l-0 border-neutral-100 rounded-r-[8px]",
            pathname === route.href && "bg-neutral-50 text-neutral-900",
            i === 0 && "rounded-tr-[16px]",
          )}
        >
          {route.icon} {route.text}
        </Link>
      ))}
      <LogoutBtn className="w-full rounded-br-[16px] rounded-tr-[8px] text-sm py-4" />
    </div>
  );
};
