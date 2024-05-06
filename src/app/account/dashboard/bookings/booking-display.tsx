"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type {
  Booking,
  BookingRoom,
  BookingRoomGuestDetails,
  Room,
} from "@prisma/client";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader } from "~/components/ui/loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn, formatPlural } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

type BookingType = Booking & {
  rooms: (BookingRoom & {
    guestDetails: BookingRoomGuestDetails[];
    room: Room;
  })[];
  totalPaid: number;
};

const CancelBookingButton = ({ booking }: { booking: BookingType }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const cancelBooking = api.account.cancelBooking.useMutation({
    onSuccess: () => {
      setShowModal(false);
      router.refresh();
    },
  });

  return (
    <Dialog onOpenChange={(val) => setShowModal(val)} open={showModal}>
      <DialogTrigger
        disabled={
          booking.paymentStatus === "PENDING" || cancelBooking.isLoading
        }
        asChild
      >
        <button
          disabled={
            booking.paymentStatus === "PENDING" || cancelBooking.isLoading
          }
          className="flex items-center gap-1 text-sm font-normal text-red-400 underline ring-red-200 transition-all duration-300 active:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel booking
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Cancel booking?</DialogTitle>
        <DialogDescription>
          {booking.paymentType === "FULL_UPFRONT"
            ? "Since you paid in full, your payment will be refunded."
            : "Your payment will not be refunded!"}
        </DialogDescription>

        <div className="flex w-full items-center gap-2">
          <DialogClose className="w-full" asChild>
            <Button className="w-full rounded-md bg-neutral-50 text-neutral-900 ring-neutral-100 transition-all duration-300 active:ring-2">
              Don&apos;t cancel
            </Button>
          </DialogClose>
          <Button
            className="w-full rounded-md ring-red-200 transition-all duration-300 active:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={cancelBooking.isLoading}
            onClick={() => cancelBooking.mutate({ bookingId: booking.id })}
          >
            Cancel booking{" "}
            {cancelBooking.isLoading && (
              <Loader
                label={null}
                labelClassName="w-fit p-0"
                loaderClassName="text-white w-fit p-0"
                containerClassName="w-fit p-0"
              />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  booking: BookingType;
}

export const BookingStatusDisplay = ({ booking }: Props) => {
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

  if (booking.canceled) {
    return (
      <p className="w-fit rounded-[4px] bg-neutral-50 p-1 text-xs font-bold tracking-normal text-neutral-700">
        CANCELED
      </p>
    );
  }

  return (
    <p
      className={cn(
        "w-fit rounded-[4px] p-1 text-xs font-bold tracking-normal",
        {
          "bg-green-200 text-green-900": booking.paymentStatus === "PAID",
          "bg-red-200 text-red-900": booking.paymentStatus === "FAILED",
          "bg-neutral-50 text-neutral-700": booking.paymentStatus === "PENDING",
        },
      )}
    >
      {getPaymentStatusDisplay()}
    </p>
  );
};

const BookingMainDataDisplay = ({ booking }: Props) => {
  const checkInDisplay = () => {
    if (booking.customerCheckIn) {
      return (
        <div className="rounded-[8px] bg-neutral-50 p-2">
          <p className="text-xs text-neutral-700">You checked in on</p>
          <p className="flex items-center gap-2 text-sm font-bold text-red-400">
            {new Intl.DateTimeFormat().format(booking.customerCheckIn)}{" "}
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3 w-3 text-neutral-700" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm text-neutral-700">
                  {booking.customerCheckIn.toISOString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs text-neutral-700">Check in</p>
        <p className="text-sm font-bold text-red-400">
          {new Intl.DateTimeFormat().format(booking.bookedCheckIn)}{" "}
        </p>
      </div>
    );
  };

  const checkOutDisplay = () => {
    if (booking.customerCheckOut) {
      return (
        <div className="rounded-[8px] bg-neutral-50 p-2">
          <p className="text-xs text-neutral-700">You checked out on</p>
          <p className="flex items-center gap-2 text-sm font-bold text-red-400">
            {new Intl.DateTimeFormat().format(booking.customerCheckOut)}{" "}
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3 w-3 text-neutral-700" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm text-neutral-700">
                  {booking.customerCheckOut.toISOString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs text-neutral-700">Check out</p>
        <p className="text-sm font-bold text-red-400">
          {new Intl.DateTimeFormat().format(booking.bookedCheckOut)}{" "}
        </p>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-4">
      {checkInDisplay()}
      {checkOutDisplay()}

      <div
        className={cn(
          !!booking.customerCheckOut && "rounded-[8px] bg-neutral-50 p-2",
        )}
      >
        <p className="text-xs text-neutral-700">Total stay</p>
        <p className="text-sm font-bold text-red-400">
          {booking.calculatedStayInDays}{" "}
          {formatPlural(booking.calculatedStayInDays > 1, "day", "days")}
        </p>
      </div>
    </div>
  );
};

export const BookingBillingDetailsDisplay = ({
  booking,
  showBillingDetails,
  hideSeparators = false,
}: Props & { showBillingDetails: boolean; hideSeparators?: boolean }) => {
  if (!showBillingDetails) return null;

  return (
    <>
      {!hideSeparators && <hr className="my-2 border-neutral-100" />}

      <div className="flex w-full flex-wrap items-start gap-4">
        <div>
          <p className="text-xs text-neutral-700">Full name</p>
          <p className="text-sm font-bold text-red-400">
            {booking.personalDetailsFirstName} {booking.personalDetailsLastName}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Age</p>
          <p className="text-sm font-bold text-red-400">
            {booking.personalDetailsAge}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Email</p>
          <p className="text-sm font-bold text-red-400">
            {booking.personalDetailsEmail}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Phone number</p>
          <p className="text-sm font-bold text-red-400">
            {!!booking.personalDetailsPhoneNum &&
            !!booking.personalDetailsPhoneNumCountry
              ? `(${booking.personalDetailsPhoneNumCountry}) ${booking.personalDetailsPhoneNum}`
              : "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Country or Region</p>
          <p className="text-sm font-bold text-red-400">
            {booking.billingDetailsCountryOrRegion}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">City or Town</p>
          <p className="text-sm font-bold text-red-400">
            {booking.billingDetailsCityOrTown}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Address</p>
          <p className="text-sm font-bold text-red-400">
            {booking.billingDetailsAddress}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-700">Postal Code</p>
          <p className="text-sm font-bold text-red-400">
            {booking.billingDetailsPostalCode}
          </p>
        </div>
      </div>

      {!hideSeparators && <hr className="my-2 border-neutral-100" />}
    </>
  );
};

export const BookingRoomGuestsDisplay = ({
  guests,
  showGuests,
}: {
  guests: BookingRoomGuestDetails[];
  showGuests: boolean;
}) => {
  if (!showGuests) return null;

  if (!guests.length) {
    return (
      <p className="my-1 text-sm font-normal text-neutral-700">
        No guests specified
      </p>
    );
  }

  return (
    <div className="my-1 flex flex-wrap items-center gap-2">
      {guests.map((guest, i) => (
        <div
          key={guest.id}
          className="flex items-start gap-1 font-normal text-neutral-700"
        >
          <p className="text-xs italic text-neutral-700">#{i + 1}</p>
          <div>
            <p className="text-neutral-900">
              {guest.firstName} {guest.lastName}
            </p>
            <p className="">Age {guest.age}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BookingPriceDataDisplay = ({ booking }: Props) => {
  if (booking.customerCheckOut) {
    return (
      <div className="mx-1 rounded-md bg-neutral-50 p-2">
        <div className="flex w-full items-start justify-between">
          <p className="text-xs font-normal text-neutral-700">Amount paid</p>
          <p className="text-sm font-bold text-neutral-900">
            ${(booking.baseRoomsPrice * booking.calculatedStayInDays) / 100}
          </p>
        </div>
        <p className="mt-1 w-full text-right text-sm font-bold text-neutral-900">
          {booking.otherServicesPrice
            ? `+ Other services ($${booking.otherServicesPrice / 100})`
            : "+ No other services ($0)"}
        </p>
        <hr className="my-2 border-neutral-100" />
        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-normal text-neutral-700">total:</p>

          <p className="mt-1 w-full text-right text-sm font-bold text-red-400">
            $
            {(booking.baseRoomsPrice * booking.calculatedStayInDays +
              (booking?.otherServicesPrice ?? 0)) /
              100}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-normal text-neutral-700">Subtotal:</p>
          <p className="text-sm font-bold text-neutral-900">
            ${booking.baseRoomsPrice / 100}
          </p>
        </div>
        <p className="w-full text-right text-sm font-bold text-neutral-900">
          x {booking.calculatedStayInDays}{" "}
          {booking.calculatedStayInDays > 1 ? "days" : "day"}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-xs font-normal text-neutral-700">Total:</p>
          <p className="text-sm font-bold text-neutral-900">
            ${(booking.baseRoomsPrice * booking.calculatedStayInDays) / 100}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-normal text-neutral-700">
            Amount paid (
            <span className="font-bold italic text-red-400">
              {booking.paymentType === "RESERVATION_HOLD"
                ? "Reservation hold"
                : "Fully paid"}
            </span>
            ):
          </p>
          <p className="text-sm font-bold text-neutral-900">
            ${booking.totalPaid / 100}
          </p>
        </div>
      </div>

      {!booking.customerCheckOut && (
        <>
          <hr className="billingRoomsDataCopyborder-neutral-100 my-2" />

          <div className="flex items-center justify-between">
            <p className="text-xs font-normal text-neutral-700">
              Amount to pay on check in
            </p>
            <p className="text-sm font-bold text-red-400">
              ${booking.priceToPayOnCheckIn / 100}
            </p>
          </div>
        </>
      )}
    </>
  );
};

export const BookingDisplay = ({ booking }: Props) => {
  const [containerRef] = useAutoAnimate();
  const [roomContainerRef] = useAutoAnimate();
  const [showGuests, setShowGuests] = useState(false);
  const [showBillingDetails, setShowBillingDetails] = useState(false);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  // Solve hydration errors
  if (!showContent) return null;

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="border-[1px] border-neutral-100 p-4"
        style={{ width: "min(500px, 100%)" }}
      >
        <div className="flex flex-wrap items-center justify-between">
          <p className="text-xs font-bold text-neutral-700">{booking.id}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-neutral-700">
              {new Intl.DateTimeFormat().format(booking.createdOn)}
            </p>

            <BookingStatusDisplay booking={booking} />
          </div>
        </div>
        <hr className="my-2 border-neutral-100" />

        <BookingMainDataDisplay booking={booking} />

        <BookingBillingDetailsDisplay
          booking={booking}
          showBillingDetails={showBillingDetails}
        />

        <p className="mt-2 text-xs text-neutral-700">Rooms</p>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-8 text-sm font-bold text-red-400">
          {booking.rooms.map((room) => (
            <li key={room.id}>
              <div className="flex flex-col gap-1" ref={roomContainerRef}>
                <div className="flex w-full items-center justify-between gap-4">
                  <p>{room.room.name}</p>{" "}
                  <span className="font-normal text-neutral-700">
                    ${room.room.price / 100}
                    <span className="text-xs">/night</span>
                  </span>
                </div>

                <BookingRoomGuestsDisplay
                  showGuests={showGuests}
                  guests={room.guestDetails}
                />
              </div>
            </li>
          ))}
        </ul>

        <hr className="my-2 border-neutral-100" />

        <BookingPriceDataDisplay booking={booking} />

        <hr className="my-2 border-neutral-100" />

        {!booking.canceled && (
          <div className="flex items-center gap-2">
            {!booking.customerCheckOut && (
              <>
                <CancelBookingButton booking={booking} />

                <div className="h-[14px] w-[1px] bg-neutral-100" />
              </>
            )}

            <button
              onClick={() => setShowGuests((prev) => !prev)}
              className="text-sm font-normal text-red-400 underline ring-red-200 transition-all duration-300 active:ring-2"
            >
              {showGuests ? "Hide guests" : "Show guests"}
            </button>

            <div className="h-[14px] w-[1px] bg-neutral-100" />

            <button
              onClick={() => setShowBillingDetails((prev) => !prev)}
              className="text-sm font-normal text-red-400 underline ring-red-200 transition-all duration-300 active:ring-2"
            >
              {showBillingDetails
                ? "Hide billing details"
                : "Show billing details"}
            </button>
          </div>
        )}

        {(booking.fulfillmentStatus === "CUSTOMER_CHECKED_OUT_ON_TIME" ||
          booking.fulfillmentStatus === "CUSTOMER_CHECKED_OUT_EARLY") && (
          <>
            <hr className="my-2 border-neutral-100" />
            <p className="w-full text-center text-sm font-bold text-neutral-900">
              We hope you had a good time!
            </p>
          </>
        )}

        {booking.paymentStatus === "FAILED" && (
          <>
            <hr className="my-2 border-neutral-100" />
            <div className="flex flex-col gap-2">
              <p className="w-full text-center text-sm font-bold text-neutral-900">
                Your payment failed.
              </p>
            </div>
          </>
        )}

        {booking.fulfillmentStatus === "WAITING_FOR_CUSTOMER" &&
          !booking.canceled &&
          booking.paymentStatus === "PAID" && (
            <>
              <hr className="my-2 border-neutral-100" />
              <p className="w-full text-center text-sm font-bold text-neutral-900">
                We&apos;ll be waiting for you!
              </p>
            </>
          )}

        {booking.canceled && (
          <div className="flex w-auto flex-col items-center gap-2 text-center">
            <p className="w-full text-center text-sm font-bold text-neutral-900">
              This booking was canceled.
            </p>

            {booking.stripeRefundId && (
              <p className="text-xs text-neutral-700">
                A refund was issued to you (id: {booking.stripeRefundId}),
                please contact support for more details!
              </p>
            )}
          </div>
        )}

        {booking.fulfillmentStatus === "MISSED" && (
          <>
            <hr className="my-2 border-neutral-100" />
            <p className="w-full text-center text-sm font-bold text-neutral-900">
              You missed this booking, please contact support for more details.
            </p>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};
