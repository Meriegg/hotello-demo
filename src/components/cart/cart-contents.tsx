"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Loader } from "../ui/loader";
import type { Room } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const RoomDisplay = ({ room }: { room: Room }) => {
  const apiUtils = api.useUtils();
  const removeItemMutation = api.cart.removeItem.useMutation({
    onSuccess: async (data) => {
      await fetch("/api/setcookie", {
        method: "POST",
        body: JSON.stringify({
          key: "cart",
          value: data.newToken,
          verificationKey: data.cookieVerificationToken,
          args: {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
          },
        }),
      });

      apiUtils.cart.getProducts.invalidate().catch((e) => console.error(e));
      apiUtils.cart.getProductIds.invalidate().catch((e) => console.error(e));
      apiUtils.cart.getCartTotal.invalidate().catch((e) => console.error(e));
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className="h-[50px] min-w-[75px] rounded-lg bg-neutral-200"></div>
      <div className="flex flex-col justify-between">
        <p className="text-sm font-bold text-neutral-900">{room.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-red-400">${room.price / 100}</p>
          <p className="text-neutral-200">•</p>
          <button
            onClick={() => removeItemMutation.mutate({ productId: room.id })}
            disabled={removeItemMutation.isLoading}
            className="text-xs text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
          >
            remove
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartContents = ({
  onCheckoutClick,
}: {
  onCheckoutClick?: () => void;
}) => {
  const [containerRef] = useAutoAnimate<HTMLDivElement>();
  const [stayInNights, setStayInNights] = useState(1);
  const products = api.cart.getProducts.useQuery(undefined, {
    retry: 0,
  });
  const cartTotal = api.cart.getCartTotal.useQuery(undefined, {
    retry: 0,
  });

  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-4" ref={containerRef}>
      {products.isLoading && (
        <Loader label="Fetching rooms" containerClassName="py-2 pb-6" />
      )}
      {products.isError && (
        <div className="flex w-full flex-col gap-2 pb-6 text-center">
          <p className="font-bold text-neutral-900">Oh snap!</p>
          <p className="max-w-prose text-xs text-neutral-700">
            {products.error?.message ||
              "An error happened, please try again or contact support."}
          </p>
        </div>
      )}
      {!products.isLoading &&
        !products.isError &&
        products.data.products.map((room) => (
          <RoomDisplay room={room} key={room.id} />
        ))}
      {products?.data?.lessThanCookieWarn && (
        <p className="w-full text-center text-xs font-bold text-yellow-500">
          Not all items in your cart could be retrieved.
        </p>
      )}
      {!cartTotal.isError && (
        <div className="flex flex-col gap-2">
          <hr className="border-neutral-200" />
          <p className="flex items-center gap-1 text-xs text-neutral-700">
            Subtotal:{" "}
            <span className="text-sm font-bold text-red-400">
              {cartTotal.isLoading && (
                <Loader2 className="w-3 h-3 text-neutral-700 animate-spin" />
              )}
              {!cartTotal.isLoading &&
                !cartTotal.isError &&
                `$${(cartTotal.data.total * stayInNights).toFixed(2)}`}
              {cartTotal.isError && "Error"}
            </span>
            {!cartTotal.isLoading &&
              !cartTotal.isError &&
              `/${stayInNights} ${stayInNights > 1 ? "nights" : "night"}`}
          </p>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
              <p className="text-xs text-neutral-700">Your stay:</p>
              <button
                className="text-lg text-red-400"
                onClick={() =>
                  setStayInNights((prev) => {
                    if (prev === 1) {
                      return prev;
                    }
                    return prev - 1;
                  })
                }
              >
                -
              </button>
              <p className="text-xs font-bold text-neutral-900">
                {stayInNights} {stayInNights > 1 ? "nights" : "night"}
              </p>
              <button
                className="text-lg text-red-400"
                onClick={() => setStayInNights((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <Link
              href="/checkout"
              onClick={onCheckoutClick}
              className="flex items-center gap-2 text-xs font-bold text-red-400 hover:underline"
            >
              Continue to checkout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
