"use client";

import Link from "next/link";
import { WEBSITE_LINK } from "@mariodev14/socials";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { Portal } from "../Portal";
import type { NavbarTheme, NavLink } from "./Navbar-content";

interface Props {
  theme: NavbarTheme;
  pathname: string;
  links: NavLink[];
}

export const MobileMenu = ({ theme, pathname, links }: Props) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "md:hidden flex flex-col items-start justify-center gap-2 w-[30px] h-[30px]",
          isOpen && "-gap-2",
        )}
      >
        <div
          className={cn(
            "transform transition-all duration-300 w-full border-[1px]",
            isOpen && "rotate-45",
            {
              "border-white": theme === "dark",
              "border-neutral-900": theme === "light",
            },
          )}
        >
        </div>
        <div
          className={cn(
            "transform transition-all duration-300 border-[1px]",
            isOpen ? "w-full -rotate-45" : "w-[15px]",
            {
              "border-white": theme === "dark",
              "border-neutral-900": theme === "light",
            },
          )}
        >
        </div>
      </button>

      <Portal targetNode={document.body}>
        <nav
          className={cn(
            "absolute transition-all md:hidden flex flex-col gap-8 items-start pl-8 justify-center duration-300 transform w-full h-full top-0 left-0",
            isOpen
              ? "translate-x-0 scale-x-100 opacity-100"
              : "-translate-x-full scale-x-50 opacity-0",
            {
              "bg-black/90 text-neutral-200 backdrop-blur-sm": theme === "dark",
              "bg-neutral-50 text-neutral-700": theme === "light",
            },
          )}
        >
          {links.map((link, idx) => (
            <Link
              onClick={() => setOpen(false)}
              key={idx}
              href={link.href}
              className={cn(
                "hover:underline transtion-all duration-300 text-2xl font-normal tracking-wide",
                {
                  "hover:text-white": theme === "dark",
                  "hover:text-gray-900": theme === "light",
                },
                pathname === link.href && {
                  "text-white": theme === "dark",
                  "text-gray-900": theme === "light",
                },
              )}
            >
              {link.text}
            </Link>
          ))}
          <p className="text-sm font-light text-wide absolute bottom-4 left-4">
            &copy; 2023 - 2024{" "}
            <a
              href={WEBSITE_LINK}
              referrerPolicy="no-referrer"
              className="underline font-bold"
            >
              MarioDev
            </a>
          </p>
        </nav>
      </Portal>
    </>
  );
};
