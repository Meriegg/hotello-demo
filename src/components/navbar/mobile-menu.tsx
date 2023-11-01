"use client";

import Link from "next/link";
import autoAnimate from "@formkit/auto-animate";
import { Portal } from "../Portal";
import { WEBSITE_LINK } from "@mariodev14/socials";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { NavbarTheme, NavLink } from "./navbar-content";

interface Props {
  theme: NavbarTheme;
  pathname: string;
  links: NavLink[];
}

export const MobileMenu = ({ theme, pathname, links }: Props) => {
  const parent = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = isOpen ? "hidden" : "unset";

    parent?.current && autoAnimate(parent.current, { duration: 500 });
  }, [isOpen, parent]);

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "flex h-[30px] w-[30px] flex-col items-start justify-center gap-2 md:hidden",
          isOpen && "-gap-2",
        )}
      >
        <div
          className={cn(
            "w-full transform border-[1px] transition-all duration-300",
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
            "transform border-[1px] transition-all duration-300",
            isOpen ? "w-full -rotate-45" : "w-[15px]",
            {
              "border-white": theme === "dark",
              "border-neutral-900": theme === "light",
            },
          )}
        >
        </div>
      </button>

      <Portal
        targetNode={document.body}
      >
        <nav
          className={cn(
            "fixed left-0 top-0 z-20 flex h-full w-full transform pl-8 transition-all duration-300 md:hidden",
            isOpen
              ? "translate-x-0 scale-x-100 opacity-100"
              : "-translate-x-full scale-x-50 opacity-0",
            {
              "bg-black/90 text-neutral-200 backdrop-blur-sm": theme === "dark",
              "bg-neutral-50 text-neutral-700": theme === "light",
            },
          )}
        >
          <div
            className="flex flex-col w-full items-start justify-center gap-8"
            ref={parent}
          >
            {isOpen && (
              <>
                {links.map((link, idx) => (
                  <Link
                    onClick={() => setOpen(false)}
                    key={idx}
                    href={link.href}
                    className={cn(
                      "transtion-all text-2xl font-normal tracking-wide duration-300 hover:underline",
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
                <p className="text-wide absolute bottom-4 left-0 w-fit text-sm font-light">
                  &copy; 2023 - 2024{" "}
                  <a
                    href={WEBSITE_LINK}
                    referrerPolicy="no-referrer"
                    className="font-bold underline"
                  >
                    MarioDeear
                  </a>
                </p>
              </>
            )}
          </div>
        </nav>
      </Portal>
    </>
  );
};
