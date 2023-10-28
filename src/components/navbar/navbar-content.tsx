import Link from "next/link";
import { Fragment } from "react";
import { cn } from "~/lib/utils";
import { MaxWidthContainer } from "../MaxWidthContainer";
import { MobileMenu } from "./mobile-menu";

interface Props {
  pathname: string;
  topScroll: number;
}

export type NavbarTheme = "light" | "dark";
export type NavLink = {
  href: string;
  text: string;
  notification?: JSX.Element | string | number;
};

export const NavbarContent = ({ pathname, topScroll }: Props) => {
  const themesByRoute: Record<string, NavbarTheme> = {
    "/": "dark",
  };

  // Get the current theme base on the current route
  // Will return `light` by default
  const getTheme = (): NavbarTheme => {
    const routeKeys = Object.keys(themesByRoute);

    const foundRouteKey =
      routeKeys.find((route) => {
        const pathRegExp = new RegExp(pathname.replace("/", "\\/"), "g");

        return pathRegExp.test(route);
      }) ?? "NOT_FOUND";

    return themesByRoute[foundRouteKey] ?? "light";
  };

  const navLinks: NavLink[] = [
    {
      text: "Home",
      href: "/",
    },
    {
      text: "Rooms",
      href: "/rooms",
    },
    {
      text: "Restaurant",
      href: "/restaurant",
    },
    {
      text: "Contact",
      href: "/contact",
    },
    {
      text: "Account",
      href: "/account",
    },
  ];

  return (
    <div
      className={cn(
        "sticky top-0 z-30 h-24 w-full transition-all duration-300",
        topScroll > 0 && getTheme() === "dark" && "backdrop-blur-sm",
        {
          "bg-gradient-to-b from-black to-black/0 ": getTheme() === "dark",
          "bg-white": getTheme() === "light",
        },
      )}
    >
      <MaxWidthContainer className="relative flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileMenu pathname={pathname} theme={getTheme()} links={navLinks} />

          <img
            src={getTheme() === "dark" ? "/logo_sm_dark.svg" : "/logo_sm.svg"}
            className="h-auto w-[100px]"
            alt="Hotello | LUXURY"
          />
        </div>

        <div
          className={cn(
            "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform items-center gap-3 text-sm tracking-wide transition-all duration-300 md:flex",
            {
              "text-neutral-200": getTheme() === "dark",
              "text-neutral-700": getTheme() === "light",
            },
          )}
        >
          {navLinks.map((link, idx) => (
            <Fragment key={idx}>
              <Link
                className={cn(
                  "transtion-all duration-300 hover:underline",
                  {
                    "hover:text-white": getTheme() === "dark",
                    "hover:text-gray-900": getTheme() === "light",
                  },
                  pathname === link.href && {
                    "text-white": getTheme() === "dark",
                    "text-gray-900": getTheme() === "light",
                  },
                )}
                href={link.href}
              >
                {link.text}
              </Link>
              {idx !== navLinks.length - 1 && <p>•</p>}
            </Fragment>
          ))}
        </div>

        <button className="bg-red-400 px-8 py-3 text-sm text-white">
          Book now!
        </button>
      </MaxWidthContainer>
    </div>
  );
};
