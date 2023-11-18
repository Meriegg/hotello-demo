"use client";

import type { Room, RoomCategory } from "@prisma/client";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

type RoomWithCategory = Room & {
  category: RoomCategory;
};

interface Props {
  items: RoomWithCategory[];
}

export const CheckoutItems = ({ items }: Props) => {
  const apiUtils = api.useUtils();
  const removeFromCart = api.cart.removeItem.useMutation({
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
    },
    onSettled: () => {
      apiUtils.cart.invalidate().catch((e) => console.error(e));
      apiUtils.checkout.getCheckoutSession.invalidate().catch((e) =>
        console.error(e)
      );
    },
    retry: 0,
  });

  return (
    <table
      className="table-auto text-left flex-1"
      cellPadding="16px"
    >
      <thead className="text-neutral-700 font-light text-sm border-b-[1px] border-neutral-100">
        <tr>
          <th className="font-light">#</th>
          <th className="font-light">Name</th>
          <th className="font-light">Price</th>
          <th className="font-light">Additional</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {items.map((room, i) => (
          <tr key={i}>
            <td>
              <img
                className="max-w-[70px] rounded-md"
                src={room.images[0]}
              />
            </td>
            <td className="text-sm font-bold text-neutral-700 max-w-[250px]">
              {room.name}
            </td>
            <td className="text-red-400 text-sm font-bold">
              ${room.price.toString()}
              <span className="text-xs font-light">/night</span>
            </td>
            <td>
              <p className="text-xs text-neutral-700">
                • Accommodates {room.accommodates}{" "}
                {room.accommodates > 1 ? "people" : "person"}
              </p>
              <p className="text-xs text-neutral-700">
                • {room.category.name}
              </p>
              {room.discountPercentage && (
                <p className="text-xs text-neutral-700">
                  • ${room.discountPercentage}% discount
                </p>
              )}
              <Link
                href={`/rooms/${room.id}`}
                className="text-xs text-red-400 underline"
              >
                • More details
              </Link>
            </td>
            <td>
              <button
                disabled={removeFromCart.isLoading}
                onClick={() => removeFromCart.mutate({ productId: room.id })}
                className="disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
