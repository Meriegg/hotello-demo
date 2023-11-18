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
import { cn } from "~/lib/utils";

export const CartButton = () => {
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
    <>
      <Portal
        targetNode={document.body}
      >
        <div
          className={cn(
            "fixed duration-300 transform z-20 inset-0 bg-black/80",
            {
              "opacity-100": isCartOpen,
              "scale-0 opacity-0": !isCartOpen,
            },
          )}
          style={{
            transition: `transform 0s ease ${
              !isCartOpen ? ".3s" : "0s"
            }, opacity .3s ease`,
          }}
        >
        </div>
      </Portal>
      <div
        ref={cartRef}
        className={cn(
          "absolute transition-all duration-300 md:w-[450px] right-0 md:right-4 top-24 h-auto bg-white border-[1px] border-t-0 border-neutral-200 transform overflow-hidden",
          {
            "translate-y-0 opacity-100 w-full": isCartOpen,
            "translate-y-2 opacity-0 w-0 h-0": !isCartOpen,
          },
        )}
      >
        <div className="w-full flex items-center justify-between p-4">
          <p className="text-sm text-neutral-700">Your cart</p>
          <button onClick={() => setCartOpen(false)}>
            <XIcon className="w-4 h-4 text-neutral-900" />
          </button>
        </div>
        <CartContents onCheckoutClick={() => setCartOpen(false)} />
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
              setCartOpen(!isCartOpen);
              return;

            default:
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
    </>
  );
};
