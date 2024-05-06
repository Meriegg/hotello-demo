"use client";

import {
  CornerUpLeft,
  CornerUpRight,
  InfoIcon,
  Loader2,
  PlusIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import {
  BookingStatusDisplay,
  BookingBillingDetailsDisplay,
  BookingPriceDataDisplay,
  BookingRoomGuestsDisplay,
} from "~/app/account/dashboard/bookings/booking-display";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Loader } from "~/components/ui/loader";
import { useToast } from "~/hooks/use-toast";
import { formatPlural } from "~/lib/utils";
import { api } from "~/trpc/react";
import { AddServiceForm } from "./add-service-form";
import { useState } from "react";

const DataEntry = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-neutral-700">{label}</p>
      <p className="text-sm font-bold text-red-400">{value}</p>
    </div>
  );
};

const Page = ({
  params: { bookingId },
}: {
  params: { bookingId?: string };
}) => {
  const apiUtils = api.useUtils();
  const { toast } = useToast();
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);

  const removeService = api.admin.bookingActions.removeOtherService.useMutation(
    {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message ?? "Something went wrong, please try again.",
        });
      },
      onSuccess: () => {
        apiUtils.admin.getBooking
          .invalidate()
          .catch((err) => console.error(err));
      },
    },
  );
  const booking = api.admin.getBooking.useQuery({ bookingId: bookingId ?? "" });
  const markAsCheckedIn =
    api.admin.bookingActions.markCustomerAsCheckedIn.useMutation({
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message ?? "Something went wrong, please try again.",
        });
      },
      onSuccess: () => {
        apiUtils.admin.getBooking
          .invalidate()
          .catch((err) => console.error(err));
      },
    });
  const markAsCheckedOut =
    api.admin.bookingActions.markCustomerAsCheckedOut.useMutation({
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message ?? "Something went wrong, please try again.",
        });
      },
      onSuccess: () => {
        apiUtils.admin.getBooking
          .invalidate()
          .catch((err) => console.error(err));
      },
    });

  if (booking.isLoading) {
    return <Loader label="Fetching data" />;
  }

  if (booking.isError || !booking.data) {
    return (
      <p className="w-full text-center text-sm text-neutral-700">
        {booking.error?.message ?? "Failed to get booking."}
      </p>
    );
  }

  const bookingData = booking.data;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="w-full justify-center rounded-xl bg-neutral-50 px-2 py-4">
        {bookingData.fulfillmentStatus === "MISSED" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Customer missed this booking.
          </p>
        )}

        {bookingData.fulfillmentStatus === "WAITING_FOR_CUSTOMER" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Waiting for customer.
          </p>
        )}

        {bookingData.fulfillmentStatus === "CUSTOMER_CHECKED_IN_LATE" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Checked in late.
          </p>
        )}

        {bookingData.fulfillmentStatus === "CUSTOMER_CHECKED_IN_ON_TIME" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Checked in on time.
          </p>
        )}

        {bookingData.fulfillmentStatus === "CUSTOMER_CHECKED_OUT_ON_TIME" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Checked out on time.
          </p>
        )}

        {bookingData.fulfillmentStatus === "CUSTOMER_CHECKED_OUT_EARLY" && (
          <p className="text-center text-sm font-bold text-neutral-700">
            Checked out early.
          </p>
        )}
      </div>
      <div className="flex items-start gap-2">
        <div className="flex max-w-[300px] flex-1 flex-col gap-2">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-lg bg-neutral-50 px-2 py-2">
            <BookingStatusDisplay booking={booking.data} />

            <p className="text-xs font-bold text-neutral-700">
              Booked on{" "}
              {new Intl.DateTimeFormat().format(bookingData.createdOn)}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-lg bg-neutral-50 px-2 py-2">
            <DataEntry
              label="Check in"
              value={new Intl.DateTimeFormat().format(
                bookingData.bookedCheckIn,
              )}
            />

            <DataEntry
              label="Check out"
              value={new Intl.DateTimeFormat().format(
                bookingData.bookedCheckOut,
              )}
            />

            <DataEntry
              label="Total stay"
              value={`${bookingData.calculatedStayInDays} ${formatPlural(
                bookingData.calculatedStayInDays !== 1,
                "day",
                "days",
              )}`}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-start gap-4 rounded-lg bg-neutral-50 px-4 py-4">
            <BookingBillingDetailsDisplay
              showBillingDetails={true}
              booking={booking.data}
              hideSeparators={true}
            />
          </div>

          <div className="flex flex-col gap-0 rounded-lg bg-neutral-50 px-4 py-4">
            <p className="text-xs text-neutral-700">Rooms</p>
            <div className="mt-1 flex flex-col gap-1">
              {bookingData.rooms.map((room) => (
                <div className="flex w-full flex-col gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-red-400">
                      &bull; {room.room.name}
                    </p>

                    <p className="text-neutraql-700 text-sm">
                      ${room.room.price / 100}/night
                    </p>
                  </div>

                  <BookingRoomGuestsDisplay
                    showGuests={true}
                    guests={room.guestDetails}
                  />
                </div>
              ))}
            </div>

            <hr className="my-2 border-neutral-100" />

            <BookingPriceDataDisplay booking={booking.data} />
          </div>
        </div>

        <div className="flex max-w-[350px] flex-1 flex-col gap-2">
          <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 px-4 py-4">
            <p className="text-xs text-neutral-700">Actions</p>
            {!bookingData.customerCheckIn && (
              <button
                onClick={() =>
                  markAsCheckedIn.mutate({
                    bookingId: bookingData.id,
                  })
                }
                disabled={markAsCheckedIn.isLoading}
                className="flex items-center justify-start gap-2 text-sm font-bold text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
              >
                {markAsCheckedIn.isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-inherit" />
                )}
                Mark customer as checked in{" "}
                <CornerUpRight className="h-3 w-3 text-inherit" />
              </button>
            )}

            {bookingData.customerCheckIn && !bookingData.customerCheckOut && (
              <button
                onClick={() =>
                  markAsCheckedOut.mutate({
                    bookingId: bookingData.id,
                  })
                }
                disabled={markAsCheckedOut.isLoading}
                className="flex items-center justify-start gap-2 text-sm font-bold text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
              >
                {markAsCheckedOut.isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-inherit" />
                )}
                Mark customer as checked out{" "}
                <CornerUpLeft className="h-3 w-3 text-inherit" />
              </button>
            )}

            {bookingData.customerCheckIn && bookingData.customerCheckOut && (
              <button className="flex items-center justify-start gap-2 text-sm font-bold text-red-400 hover:underline">
                Send PDF invoice to customer email{" "}
                <SendIcon className="h-3 w-3 text-inherit" />
              </button>
            )}

            {!bookingData.customerCheckIn && (
              <button className="flex items-center justify-start gap-2 text-sm font-bold text-red-400 hover:underline">
                Cancel booking <XIcon className="h-3 w-3 text-inherit" />
              </button>
            )}

            <hr className="border-neutral-100" />

            <p className="text-xs text-neutral-700">Other data</p>

            <p className="text-center text-sm text-neutral-900">
              Nothing to show
            </p>
          </div>

          <div className="rounded-lg bg-neutral-50 px-4 py-4">
            <p className="text-xs text-neutral-700">Other services</p>
            {!!bookingData.otherServiceEntries.length && (
              <div className="my-1 flex flex-col gap-1">
                {bookingData.otherServiceEntries.map((entry) => (
                  <div
                    className="flex items-center justify-between text-sm"
                    key={entry.id}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (
                            !confirm(
                              `Are you sure you want to delete "${entry.name}" service?`,
                            )
                          )
                            return;

                          removeService.mutate({
                            entryId: entry.id,
                            bookingId: bookingData.id,
                          });
                        }}
                        className="text-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={removeService.isLoading}
                      >
                        <XIcon className="h-3 w-3 text-inherit" />
                      </button>

                      <p>{entry.name}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-neutral-700">
                            <InfoIcon className="h-3 w-3 text-inherit" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Service details</DialogTitle>
                          </DialogHeader>

                          <div className="flex flex-col gap-2 text-sm">
                            <p className="text-neutral-700">
                              Name: {entry.name}
                            </p>
                            <p className="text-neutral-700">
                              Price: ${entry.price / 100}
                            </p>
                            <p className="text-neutral-700">
                              Billed on:{" "}
                              {new Intl.DateTimeFormat().format(
                                entry.createdOn,
                              )}
                            </p>
                            <p className="text-neutral-900">Description</p>
                            {entry.description ? (
                              <p className="text-neutral-900">
                                {entry.description}
                              </p>
                            ) : (
                              <p className="text-center text-neutral-700">
                                No description
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <p className="font-bold text-red-400">
                        ${entry.price / 100}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!bookingData.otherServiceEntries.length && (
              <p className="my-2 w-full text-center text-sm text-neutral-900">
                No other services
              </p>
            )}
            <hr className="border-neutral-100" />
            <div className="my-2 flex items-center justify-between text-xs">
              <p className="text-neutral-700">Total:</p>
              <p className="font-bold text-red-400">
                ${(bookingData.otherServicesPrice ?? 0) / 100}
              </p>
            </div>
            <hr className="border-neutral-100" />
            <div className="mt-2 flex items-center justify-end">
              <Dialog
                open={addServiceDialogOpen}
                onOpenChange={setAddServiceDialogOpen}
              >
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 text-xs font-bold text-red-400">
                    Add service <PlusIcon className="h-3 w-3 text-inherit" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a service</DialogTitle>
                  </DialogHeader>
                  <AddServiceForm
                    bookingId={bookingData.id}
                    onSuccessCb={() => {
                      setAddServiceDialogOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
