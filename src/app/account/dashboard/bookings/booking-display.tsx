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
import { useState } from "react";
import { Loader } from "~/components/ui/loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

type BookingType = Booking & {
  rooms: BookingRoom & {
    guestDetails: BookingRoomGuestDetails[];
    room: Room;
  }[];
  totalPaid: number;
};

const CancelBookingButton = ({ booking }: { booking: BookingType }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const apiUtils = api.useUtils();
  const cancelBooking = api.account.cancelBooking.useMutation({
    onSuccess: () => {
      setShowModal(false);
      router.refresh();
    },
  });

  return (
    <Dialog onOpenChange={(val) => setShowModal(val)} open={showModal}>
      <DialogTrigger
        disabled={booking.paymentStatus === "PENDING" ||
          cancelBooking.isLoading}
      >
        <button
          disabled={booking.paymentStatus === "PENDING" ||
            cancelBooking.isLoading}
          className="text-sm text-red-400 underline font-normal transition-all duration-300 active:ring-2 ring-red-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1"
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

        <div className="flex items-center gap-2 w-full">
          <DialogClose className="w-full">
            <Button className="rounded-md w-full active:ring-2 bg-neutral-50 text-neutral-900 transition-all duration-300 ring-neutral-100">
              Don&apos;t cancel
            </Button>
          </DialogClose>
          <Button
            className="rounded-md w-full active:ring-2 transition-all duration-300 ring-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={cancelBooking.isLoading}
            onClick={() => cancelBooking.mutate({ bookingId: booking.id })}
          >
            Cancel booking {cancelBooking.isLoading && (
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

export const BookingDisplay = ({ booking }: Props) => {
  const [containerRef] = useAutoAnimate();
  const [roomContainerRef] = useAutoAnimate();
  const [showGuests, setShowGuests] = useState(false);
  const [showBillingDetails, setShowBillingDetails] = useState(false);

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
    <TooltipProvider>
      <div
        ref={containerRef}
        className="border-[1px] border-neutral-100 p-4"
        style={{ width: "min(500px, 100%)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-neutral-700">{booking.id}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-neutral-700">
              {new Intl.DateTimeFormat().format(booking.createdOn)}
            </p>

            {booking.canceled
              ? (
                <p className="rounded-[4px] p-1 text-xs font-bold tracking-normal bg-neutral-50 text-neutral-700">
                  CANCELED
                </p>
              )
              : (
                <p
                  className={cn(
                    "rounded-[4px] p-1 text-xs font-bold tracking-normal",
                    {
                      "bg-green-200 text-green-900":
                        booking.paymentStatus === "PAID",
                      "bg-red-200 text-red-900":
                        booking.paymentStatus === "FAILED",
                      "bg-neutral-50 text-neutral-700":
                        booking.paymentStatus === "PENDING",
                    },
                  )}
                >
                  {getPaymentStatusDisplay()}
                </p>
              )}
          </div>
        </div>
        <hr className="my-2 border-neutral-100" />

        <div className="flex items-start gap-4">
          {booking.customerCheckIn
            ? (
              <div className="p-2 rounded-[8px] bg-neutral-50">
                <p className="text-xs text-neutral-700">You checked in on</p>
                <p className="text-sm text-red-400 font-bold flex items-center gap-2">
                  {new Intl.DateTimeFormat().format(booking.customerCheckIn)}
                  {" "}
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-3 h-3 text-neutral-700" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm text-neutral-700">
                        {booking.customerCheckIn.toISOString()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
            )
            : (
              <div>
                <p className="text-xs text-neutral-700">Check in</p>
                <p className="text-sm text-red-400 font-bold">
                  {new Intl.DateTimeFormat().format(booking.bookedCheckIn)}
                  {" "}
                </p>
              </div>
            )}

          {booking.customerCheckOut
            ? (
              <div className="p-2 rounded-[8px] bg-neutral-50">
                <p className="text-xs text-neutral-700">You checked out on</p>
                <p className="text-sm text-red-400 font-bold flex items-center gap-2">
                  {new Intl.DateTimeFormat().format(booking.customerCheckOut)}
                  {" "}
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-3 h-3 text-neutral-700" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm text-neutral-700">
                        {booking.customerCheckOut.toISOString()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
            )
            : (
              <div>
                <p className="text-xs text-neutral-700">Check out</p>
                <p className="text-sm text-red-400 font-bold">
                  {new Intl.DateTimeFormat().format(booking.bookedCheckOut)}
                  {" "}
                </p>
              </div>
            )}

          <div
            className={cn(
              !!booking.customerCheckOut && "p-2 rounded-[8px] bg-neutral-50",
            )}
          >
            <p className="text-xs text-neutral-700">Total stay</p>
            <p className="text-sm text-red-400 font-bold">
              {booking.calculatedStayInDays}{" "}
              {booking.calculatedStayInDays > 1 ? "days" : "day"}
            </p>
          </div>
        </div>

        {showBillingDetails && (
          <>
            <hr className="border-neutral-100 my-2" />

            <div className="flex items-start gap-4 flex-wrap w-full">
              <div>
                <p className="text-xs text-neutral-700">Full name</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.personalDetailsFirstName}{" "}
                  {booking.personalDetailsLastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Age</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.personalDetailsAge}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Email</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.personalDetailsEmail}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Phone number</p>
                <p className="text-sm text-red-400 font-bold">
                  {(!!booking.personalDetailsPhoneNum &&
                      !!booking.personalDetailsPhoneNumCountry)
                    ? `(${booking.personalDetailsPhoneNumCountry}) ${booking.personalDetailsPhoneNum}`
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Country or Region</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.billingDetailsCountryOrRegion}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">City or Town</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.billingDetailsCityOrTown}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Address</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.billingDetailsAddress}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-700">Postal Code</p>
                <p className="text-sm text-red-400 font-bold">
                  {booking.billingDetailsPostalCode}
                </p>
              </div>
            </div>

            <hr className="border-neutral-100 my-2" />
          </>
        )}

        <p className="text-xs text-neutral-700 mt-2">Rooms</p>
        <ul className="list-disc text-red-400 text-sm font-bold pl-8 flex flex-col gap-1 mt-1">
          {booking.rooms.map((room, i) => (
            <li
              key={i}
            >
              <div className="flex flex-col gap-1" ref={roomContainerRef}>
                <div className="flex items-center justify-between gap-4 w-full">
                  {room.room.name}{" "}
                  <span className="text-neutral-700 font-normal">
                    ${room.room.price / 100}
                    <span className="text-xs">/night</span>
                  </span>
                </div>

                {showGuests && (
                  <>
                    {!room.guestDetails.length && (
                      <p className="text-neutral-700 font-normal my-1 text-sm">
                        No guests specified
                      </p>
                    )}

                    {!!room.guestDetails.length && (
                      <div className="flex items-center flex-wrap gap-2 my-1">
                        {room.guestDetails.map((guest, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1 font-normal text-neutral-700"
                          >
                            <p className="text-xs text-neutral-700 italic">
                              #{i + 1}
                            </p>
                            <div>
                              <p className="text-neutral-900">
                                {guest.firstName} {guest.lastName}
                              </p>
                              <p className="">Age {guest.age}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        <hr className="border-neutral-100 my-2" />

        {booking.customerCheckOut
          ? (
            <div className="mx-1 p-2 rounded-md bg-neutral-50">
              <div className="w-full flex items-start justify-between">
                <p className="text-xs text-neutral-700 font-normal">
                  Amount paid
                </p>
                <p className="text-sm text-neutral-900 font-bold">
                  ${(booking.baseRoomsPrice * booking.calculatedStayInDays) /
                    100}
                </p>
              </div>
              <p className="text-sm text-neutral-900 font-bold mt-1 text-right w-full">
                {booking.otherServicesPrice
                  ? `+ Other services ($${booking.otherServicesPrice / 100})`
                  : "+ No other services ($0)"}
              </p>
              <hr className="border-neutral-100 my-2" />
              <div className="w-full flex items-center justify-between">
                <p className="text-xs text-neutral-700 font-normal">
                  total:
                </p>

                <p className="text-sm text-red-400 font-bold mt-1 text-right w-full">
                  ${((booking.baseRoomsPrice * booking.calculatedStayInDays) +
                    (booking?.otherServicesPrice ?? 0)) / 100}
                </p>
              </div>
            </div>
          )
          : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-neutral-700 font-normal text-xs">
                  Subtotal:
                </p>
                <p className="text-neutral-900 font-bold text-sm">
                  ${booking.baseRoomsPrice / 100}
                </p>
              </div>
              <p className="w-full text-right font-bold text-neutral-900 text-sm">
                x {booking.calculatedStayInDays}{" "}
                {booking.calculatedStayInDays > 1 ? "days" : "day"}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-neutral-700 font-normal text-xs">
                  Total:
                </p>
                <p className="text-neutral-900 font-bold text-sm">
                  ${(booking.baseRoomsPrice * booking.calculatedStayInDays) /
                    100}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-neutral-700 font-normal text-xs">
                  Amount paid (<span className="font-bold italic text-red-400">
                    {booking.paymentType === "RESERVATION_HOLD"
                      ? "Reservation hold"
                      : "Fully paid"}
                  </span>):
                </p>
                <p className="text-neutral-900 font-bold text-sm">
                  ${booking.totalPaid / 100}
                </p>
              </div>
            </div>
          )}

        {!booking.customerCheckOut && (
          <>
            <hr className="billingRoomsDataCopyborder-neutral-100 my-2" />

            <div className="flex items-center justify-between">
              <p className="text-neutral-700 font-normal text-xs">
                Amount to pay on check in
              </p>
              <p className="text-red-400 font-bold text-sm">
                ${booking.priceToPayOnCheckIn / 100}
              </p>
            </div>
          </>
        )}

        <hr className="border-neutral-100 my-2" />

        {!booking.canceled && (
          <div className="flex items-center gap-2">
            {!booking.customerCheckOut && (
              <>
                <CancelBookingButton booking={booking} />

                <div className="w-[1px] h-[14px] bg-neutral-100" />
              </>
            )}

            <button
              onClick={() => setShowGuests((prev) => !prev)}
              className="text-sm text-red-400 underline font-normal transition-all duration-300 active:ring-2 ring-red-200"
            >
              {showGuests ? "Hide guests" : "Show guests"}
            </button>

            <div className="w-[1px] h-[14px] bg-neutral-100" />

            <button
              onClick={() => setShowBillingDetails((prev) => !prev)}
              className="text-sm text-red-400 underline font-normal transition-all duration-300 active:ring-2 ring-red-200"
            >
              {showBillingDetails
                ? "Hide billing details"
                : "Show billing details"}
            </button>
          </div>
        )}

        {booking.customerCheckOut && (
          <>
            <hr className="border-neutral-100 my-2" />
            <p className="text-neutral-900 text-center font-bold w-full text-sm">
              We hope you had a good time!
            </p>
          </>
        )}

        {booking.paymentStatus === "FAILED" && (
          <>
            <hr className="border-neutral-100 my-2" />
            <p className="text-neutral-900 text-center font-bold w-full text-sm">
              Please go to your checkout page and try again, or create another
              booking.
            </p>
          </>
        )}

        {booking.paymentStatus === "PAID" && !booking.canceled && (
          <>
            <hr className="border-neutral-100 my-2" />
            <p className="text-neutral-900 text-center font-bold w-full text-sm">
              We&apos;ll be waiting for you!
            </p>
          </>
        )}

        {booking.canceled && (
          <div className="text-center w-auto flex flex-col gap-2 items-center">
            <p className="text-neutral-900 text-center font-bold w-full text-sm">
              This booking was canceled.
            </p>

            {booking.stripeRefundId && (
              <p className="text-xs text-neutral-700">
                A refund was issued to you (id:{" "}
                {booking.stripeRefundId}), please contact support for more
                details!
              </p>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
