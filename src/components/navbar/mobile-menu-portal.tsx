"use client";

import { Ref, useEffect, useState } from "react";
import { Portal } from "../Portal";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { WEBSITE_LINK } from "@mariodev14/socials";

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  theme: "dark" | "light";
  pathname: string;
  parent: Ref<HTMLDivElement>;
  links: { href: string; text: string }[]
}

export const MobileMenuPortal = ({ isOpen, setIsOpen, pathname, links, theme, parent }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Portal targetNode={document.body}>
      <nav
        className={cn(
          "fixed left-0 top-0 z-20 flex h-full w-full transform pl-8 transition-all duration-300 md:hidden",
          isOpen
            ? "translate-x-0 scale-x-100 opacity-100"
            : "-translate-x-full scale-x-50 opacity-0",
          {
            "bg-black/90 text-neutral-200 backdrop-blur-sm":
              theme === "dark",
            "bg-neutral-50 text-neutral-700": theme === "light",
          },
        )}
      >
        <div
          className="flex w-full flex-col items-start justify-center gap-8"
          ref={parent}
        >
          {isOpen && (
            <>
              {links.map((link) => (
                <Link
                  onClick={() => setIsOpen(false)}
                  key={link.href}
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
                  MarioDev.
                </a>
              </p>
            </>
          )}
        </div>
      </nav>
    </Portal>
  );
};
