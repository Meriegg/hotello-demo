"use client";

import { usePathname } from "next/navigation";
import { NavbarContent } from "./Navbar-content";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <>
      <NavbarContent pathname={pathname} />
    </>
  );
};
