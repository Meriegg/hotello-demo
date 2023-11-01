"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Loader } from "../ui/loader";
import type { Room } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

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
            secure: false,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
          },
        }),
      });

      apiUtils.cart.getProducts.invalidate();
      apiUtils.cart.getProductIds.invalidate();
      apiUtils.cart.getCartTotal.invalidate();
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-[75px] h-[50px] bg-neutral-200 rounded-lg"></div>
      <div className="flex flex-col justify-between">
        <p className="text-neutral-900 font-bold text-sm">{room.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-red-400">
            ${room.price.toString()}
          </p>
          <p className="text-neutral-200">•</p>
          <button
            onClick={() => removeItemMutation.mutate({ productId: room.id })}
            disabled={removeItemMutation.isLoading}
            className="text-red-400 text-xs hover:underline disabled:opacity-70 disabled:cursor-not-allowed"
          >
            remove
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartContents = () => {
  const [containerRef] = useAutoAnimate<HTMLDivElement>();
  const [stayInNights, setStayInNights] = useState(1);
  const products = api.cart.getProducts.useQuery(undefined, {
    retry: 0,
  });
  const cartTotal = api.cart.getCartTotal.useQuery(undefined, {
    retry: 0,
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-4" ref={containerRef}>
      {products.isLoading && (
        <Loader label="Fetching rooms" containerClassName="py-2 pb-6" />
      )}
      {products.isError && (
        <div className="flex flex-col text-center pb-6 gap-2">
          <p className="font-bold text-red-400">Oh snap!</p>
          <p className="text-sm max-w-prose text-neutral-700">
            {products.error?.message ||
              "An error happened, please try again or contact support."}
          </p>
        </div>
      )}
      {!products.isLoading && !products.isError &&
        products.data.products.map((room) => (
          <RoomDisplay room={room} key={room.id} />
        ))}
      {products?.data?.lessThanCookieWarn && (
        <p className="text-xs text-center w-full font-bold text-yellow-500">
          Not all items in your cart could be retrieved.
        </p>
      )}
      {!cartTotal.isError && (
        <div className="flex flex-col gap-2">
          <hr className="border-neutral-200" />
          <p className="text-xs text-neutral-700 flex items-center gap-1">
            Subtotal:{" "}
            <span className="text-sm font-bold text-red-400">
              {cartTotal.isLoading && (
                <Loader containerClassName="p-0 w-fit h-fit" label={null} />
              )}
              {!cartTotal.isLoading && !cartTotal.isError &&
                `$${(cartTotal.data.total * stayInNights).toFixed(2)}`}
            </span>
            {!cartTotal.isLoading && !cartTotal.isError &&
              `/${stayInNights} ${stayInNights > 1 ? "nights" : "night"}`}
          </p>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
              <p className="text-xs text-neutral-700">Your stay:</p>
              <button
                className="text-red-400 text-lg"
                onClick={() =>
                  setStayInNights((prev) => {
                    if (prev === 1) {
                      return prev;
                    }
                    return prev - 1;
                  })}
              >
                -
              </button>
              <p className="text-neutral-900 font-bold text-xs">
                {stayInNights} {stayInNights > 1 ? "nights" : "night"}
              </p>
              <button
                className="text-red-400 text-lg"
                onClick={() => setStayInNights((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <Link
              href="/checkout"
              className="flex font-bold items-center gap-2 text-xs text-red-400 hover:underline"
            >
              Continue to checkout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
