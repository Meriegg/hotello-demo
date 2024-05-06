"use client";

import autoAnimate from "@formkit/auto-animate";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { NavbarTheme, NavLink } from "./navbar-content";
import { MobileMenuPortal } from "./mobile-menu-portal";

interface Props {
  theme: NavbarTheme;
  pathname: string;
  links: NavLink[];
}

export const MobileMenu = ({ theme, pathname, links }: Props) => {
  const parent = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = isOpen ? "hidden" : "unset";

    parent?.current && autoAnimate(parent.current, { duration: 500 });
  }, [isOpen, parent]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
              "border-white bg-white": theme === "dark",
              "border-neutral-900 bg-neutral-900": theme === "light",
            },
          )}
        ></div>
        <div
          className={cn(
            "transform border-[1px] transition-all duration-300",
            isOpen ? "w-full -rotate-45" : "w-[15px]",
            {
              "border-white bg-white": theme === "dark",
              "border-neutral-900 bg-neutral-900": theme === "light",
            },
          )}
        ></div>
      </button>

      <MobileMenuPortal
        pathname={pathname}
        links={links}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        parent={parent}
        theme={theme}
      />
    </>
  );
};
