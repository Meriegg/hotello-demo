"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoutBtn } from "~/app/account/components/logout-btn";
import { Loader } from "~/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isError, data } = api.account.getCurrentSession.useQuery(
    undefined,
    {
      onError: () => {
        router.push("/account");
      },
    },
  );

  const routes = [
    {
      text: "Overview",
      href: "/admin",
    },
    {
      text: "Bookings",
      href: "/admin/bookings",
    },
    {
      text: "Rooms",
      href: "/admin/rooms",
    },
  ];

  const moreRoutes = [
    {
      text: "Restaurant",
      href: "/admin/restaurant",
    },
    {
      text: "Accounts",
      href: "/admin/accounts",
    },
  ]

  if (isError) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-[1px] border-t-[0] border-neutral-100 px-8 py-6">
      <div className="flex flex-wrap items-center gap-4">
        {isLoading && (
          <Loader
            label={null}
            containerClassName="w-fit p-0"
            loaderClassName="w-fit p-0"
          />
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col gap-0">
            <p className="text-sm font-bold text-neutral-900">
              {data.user.firstName} {data.user.lastName}
            </p>
            <p className="text-xs text-red-400 font-bold">
              access level{" "}
              {parseInt(data.user.adminAccessLevel.split("_")[1] ?? "0")}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm px-4 py-2 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-700 transition-all duration-300 rounded-[4px]",
                route.href === pathname && "bg-neutral-50 text-neutral-900",
              )}
            >
              {route.text}
            </Link>
          ))}

          <Popover>
            <PopoverTrigger>
              <button className="text-neutral-700 flex items-center gap-2 text-sm px-4 py-2 hover:bg-neutral-50 hover:text-neutral-900 rounded-[4px] transition-all duration-300">
                More <MenuIcon className="w-3 h-3 text-inherit" />
              </button>
            </PopoverTrigger>
            <PopoverContent asChild className="p-2" style={{ width: 'min(300px, 100%)' }}>
              <div className="flex flex-col gap-2 w-full text">
                {moreRoutes.map((route) => (
                  <Link
                    href={route.href}
                    key={route.href}
                    className={cn(
                      "text-sm px-4 w-full py-2 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-700 transition-all duration-300 rounded-[4px] text-center",
                      route.href === pathname && "bg-neutral-50 text-neutral-900",
                    )}
                  >
                    {route.text}
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <LogoutBtn className="px-4 py-2 bg-neutral-50 rounded-[4px] text-neutral-900 hover:bg-neutral-100 active:ring-2 transition-all duration-300 ring-neutral-200" />
    </div>
  );
};
