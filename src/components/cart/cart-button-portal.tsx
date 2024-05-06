"use client";

import { useEffect, useState } from "react";
import { Portal } from "../Portal";
import { cn } from "~/lib/utils";

interface Props {
  isCartOpen: boolean;
}

export const CartButtonPortal = ({ isCartOpen }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Portal targetNode={document.body}>
      <div
        className={cn("fixed inset-0 z-20 transform bg-black/80 duration-300", {
          "opacity-100": isCartOpen,
          "scale-0 opacity-0": !isCartOpen,
        })}
        style={{
          transition: `transform 0s ease ${!isCartOpen ? ".3s" : "0s"
            }, opacity .3s ease`,
        }}
      ></div>
    </Portal>
  );
};
