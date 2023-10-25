"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavbarContent } from "./Navbar-content";

// This is just a client wrapper user for getting the current path
export const Navbar = () => {
  const [topScroll, setTopScroll] = useState(0);
  const pathname = usePathname();

  const scrollCallback = () => {
    setTopScroll(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollCallback);

    return () => window.removeEventListener("scroll", scrollCallback);
  }, []);

  return <NavbarContent pathname={pathname} topScroll={topScroll} />;
};
