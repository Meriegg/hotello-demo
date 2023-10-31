"use client";

import { CartContents } from "./cart-contents";
import { api } from "~/trpc/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ArrowRight, ShoppingCart, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Portal } from "../Portal";

import { usePathname, useRouter } from "next/navigation";
import { useClickOutside } from "~/hooks/use-click-outside";

export const CartButton = () => {
  const [mainContainerRef] = useAutoAnimate();
  const [isCartOpen, setCartOpen] = useState(false);
  const [buttonRef] = useAutoAnimate<HTMLButtonElement>();
  const [cartRef] = useClickOutside<HTMLDivElement>(() => {
    setCartOpen(false);
  });
  const cartContents = api.cart.getProductIds.useQuery();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCartOpen]);

  return (
    <div ref={mainContainerRef}>
      {isCartOpen && (
        <>
          <Portal targetNode={document.body}>
            <div className="fixed inset-0 bg-black/80"></div>
          </Portal>
          <div
            ref={cartRef}
            className="absolute md:w-[450px] right-0 md:right-0 top-[73px] z-20 h-auto bg-white border-[1px] border-t-0 border-neutral-200"
          >
            <div className="w-full flex items-center justify-between p-4">
              <p className="text-sm text-neutral-700">Your cart</p>
              <button onClick={() => setCartOpen(false)}>
                <XIcon className="w-4 h-4 text-neutral-900" />
              </button>
            </div>
            <CartContents />
          </div>
        </>
      )}
      <Button
        disabled={pathname === "/checkout"}
        onClick={() => {
          if ((cartContents.data?.length ?? 0) <= 0) {
            router.push("/rooms");
            return;
          }

          if (pathname === "/") {
            router.push("/checkout");
            return;
          }

          if ((cartContents.data?.length ?? 0) > 0) {
            setCartOpen(!isCartOpen);
          }
        }}
        ref={buttonRef}
        className="w-[150px]"
      >
        {(cartContents?.data?.length ?? 0) > 0
          ? (
            <span className="flex items-center gap-2">
              Your cart <ShoppingCart className="w-4 h-4" />
            </span>
          )
          : (
            <span className="flex items-center gap-2">
              Book now <ArrowRight className="w-4 h-4" />
            </span>
          )}
      </Button>
    </div>
  );
};
