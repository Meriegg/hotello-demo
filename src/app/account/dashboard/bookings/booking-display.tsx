"use client";

import type {
  Booking,
  BookingRoom,
  BookingRoomGuestDetails,
} from "@prisma/client";
import { cn } from "~/lib/utils";

type BookingRoomType = BookingRoom & {
  guestDetails: BookingRoomGuestDetails[];
};

type BookingType = Booking & {
  rooms: BookingRoomType[];
};

interface Props {
  booking: BookingType;
}

export const BookingDisplay = ({ booking }: Props) => {
  const getPaymentStatusDisplay = () => {
    switch (booking.paymentStatus) {
      case "PAID":
        return "PAYMENT SUCCESS";

      case "FAILED":
        return "PAYMENT FAILED";

      case "PENDING":
        return "PAYMENT PENDING";
    }
  };

  return (
    <div className="p-4 border-neutral-100 border-[1px] min-w-[450px] w-fit">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-700 font-bold">{booking.id}</p>

        <div className="flex items-center gap-2">
          <p className="text-xs text-neutral-700 font-bold">
            {new Intl.DateTimeFormat().format(booking.createdOn)}
          </p>

          <p
            className={cn(
              "p-1 text-xs rounded-[4px] tracking-normal font-bold",
              {
                "text-green-900 bg-green-200": booking.paymentStatus === "PAID",
                "text-red-900 bg-red-200": booking.paymentStatus === "FAILED",
                "text-neutral-700 bg-neutral-50":
                  booking.paymentStatus === "PENDING",
              },
            )}
          >
            {getPaymentStatusDisplay()}
          </p>
        </div>
      </div>
      <hr className="border-neutral-100 my-2" />
    </div>
  );
};
