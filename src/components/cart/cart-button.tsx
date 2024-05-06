"use client";

import { CartContents } from "./cart-contents";
import { api } from "~/trpc/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ArrowRight, ShoppingCart, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useClickOutside } from "~/hooks/use-click-outside";
import { cn } from "~/lib/utils";
import { CartButtonPortal } from "./cart-button-portal";

export const CartButton = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buttonRef] = useAutoAnimate<HTMLButtonElement>();
  const [cartRef] = useClickOutside<HTMLDivElement>(() => {
    setIsCartOpen(false);
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
    <>
      <CartButtonPortal isCartOpen={isCartOpen} />

      <div
        ref={cartRef}
        className={cn(
          "absolute right-0 top-24 h-auto transform overflow-hidden border-[1px] border-t-0 border-neutral-200 bg-white transition-all duration-300 md:right-4 md:w-[450px]",
          {
            "w-full translate-y-0 opacity-100": isCartOpen,
            "h-0 w-0 translate-y-2 opacity-0": !isCartOpen,
          },
        )}
      >
        <div className="flex w-full items-center justify-between p-4">
          <p className="text-sm text-neutral-700">Your cart</p>
          <button onClick={() => setIsCartOpen(false)}>
            <XIcon className="h-4 w-4 text-neutral-900" />
          </button>
        </div>
        <CartContents onCheckoutClick={() => setIsCartOpen(false)} />
      </div>
      <Button
        disabled={pathname === "/checkout"}
        onClick={() => {
          switch (true) {
            case (cartContents.data?.length ?? 0) <= 0 && pathname !== "/rooms":
              router.push("/rooms");
              return;

            case pathname === "/":
              router.push("/checkout");
              return;

            case (cartContents.data?.length ?? 0) > 0:
              setIsCartOpen(!isCartOpen);
              return;

            default:
              setIsCartOpen(!isCartOpen);
          }
        }}
        ref={buttonRef}
        className="w-[150px]"
      >
        {(cartContents?.data?.length ?? 0) > 0 ? (
          <span className="flex items-center gap-2">
            Your cart <ShoppingCart className="h-4 w-4" />
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Book now <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </>
  );
};
