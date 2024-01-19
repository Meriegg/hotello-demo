"use client";

import type { Room, RoomCategory } from "@prisma/client";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

type RoomWithCategory = Room & {
  category: RoomCategory;
};

interface Props {
  items: RoomWithCategory[];
}

export const CheckoutItems = ({ items }: Props) => {
  const apiUtils = api.useUtils();
  const { toast } = useToast();
  const removeFromCart = api.cart.removeItem.useMutation({
    onSuccess: (data) => {
      fetch("/api/setcookie", {
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
      }).catch(() => {
        toast({
          title: "An error happened",
          description: "Could not remove item from cart.",
          variant: "destructive",
        });
      });
    },
    onSettled: () => {
      apiUtils.cart.invalidate().catch((e) => console.error(e));
      apiUtils.checkout.invalidate().catch((e) => console.error(e));
    },
    retry: 0,
  });

  return (
    <table
      className="w-full flex-1 table-auto overflow-x-scroll text-left lg:w-fit"
      cellPadding="16px"
    >
      <thead className="border-b-[1px] border-neutral-100 text-sm font-light text-neutral-700">
        <tr>
          <th className="hidden font-light lg:block">#</th>
          <th className="font-light">Name</th>
          <th className="hidden font-light md:block">Price</th>
          <th className="font-light">Additional</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {items.map((room, i) => (
          <tr key={room.id}>
            <td className="hidden lg:table-cell">
              <img
                className="hidden max-w-[70px] rounded-md lg:block"
                src={room.images[0]}
                alt="First room image"
              />
            </td>
            <td className="flex max-w-[250px] flex-col gap-2 text-sm font-bold text-neutral-700">
              {room.name}

              <p className="block text-sm font-bold text-red-400 md:hidden">
                ${room.price / 100}
                <span className="text-xs font-light">/night</span>
              </p>
            </td>
            <td className="hidden text-sm font-bold text-red-400 md:table-cell">
              ${room.price / 100}
              <span className="text-xs font-light">/night</span>
            </td>
            <td>
              <p className="text-xs text-neutral-700">
                • Accommodates {room.accommodates}{" "}
                {room.accommodates > 1 ? "people" : "person"}
              </p>
              <p className="text-xs text-neutral-700">• {room.category.name}</p>
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
                className="disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
