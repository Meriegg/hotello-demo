"use client";

import type { Room } from "@prisma/client";
import { CheckIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { CheckInOutDatePicker } from "~/components/ui/checkinout-date-picker";
import { Loader } from "~/components/ui/loader";
import { cn } from "~/lib/utils";
import type { CheckoutFormValidator } from "~/lib/zod/checkout-form";
import { calculateStayDuration } from "~/server/utils/calculate-stay-duration";
import { api } from "~/trpc/react";
import { GuestInformationForm } from "./guest-information";

interface Props {
  form: UseFormReturn<z.infer<typeof CheckoutFormValidator>>;
  items: Room[];
}

const CheckRoomDates = ({ form, items }: Props) => {
  const cartTotal = api.cart.getCartTotal.useQuery();

  const checkRoomDatesMutation = api.rooms.checkRoomsAvailability.useMutation({
    onSuccess: (data) => {
      form.setValue("step3.allRoomsAvailable", data.available);
    },
    onError: () => {
      form.setValue("step3.allRoomsAvailable", false);
    },
    onSettled: () => {
      form.trigger("step3").catch((e) => console.error(e));
    },
  });

  const formValues = form.watch("step3");

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs text-neutral-700">Check-in/Check-out dates</p>
      <CheckInOutDatePicker
        className={cn(
          checkRoomDatesMutation.isLoading && "cursor-not-allowed opacity-60",
        )}
        initialData={{
          checkIn: form.watch("step3.bookingCheckIn"),
          checkOut: form.watch("step3.bookingCheckOut"),
        }}
        onComplete={(checkIn, checkOut) => {
          form.setValue("step3.bookingCheckIn", checkIn);
          form.setValue("step3.bookingCheckOut", checkOut);

          checkRoomDatesMutation.mutate({
            roomIds: items.map((item) => item.id),
            checkInDate: checkIn,
            checkOutDate: checkOut,
          });
        }}
        showClearButton={checkRoomDatesMutation?.data?.available === false}
        clearButtonClass="text-xs text-red-400"
      />
      {checkRoomDatesMutation?.data?.available && (
        <p className="flex items-center gap-2 text-xs text-green-600">
          All rooms are available{" "}
          <CheckIcon className="h-3 w-3 text-green-600" />
        </p>
      )}
      {checkRoomDatesMutation.isLoading && (
        <Loader
          containerClassName="p-0 text-xs w-fit"
          loaderClassName="w-3 h-3 p-0"
          labelClassName="text-xs p-0"
          label="Checking"
        />
      )}
      {form.formState.errors.step3?.allRoomsAvailable?.message &&
        !checkRoomDatesMutation.isLoading && (
          <div className="flex flex-col gap-2">
            <p className="w-full text-xs text-red-400">
              The following rooms are not available within this timeframe:
            </p>
            <div>
              {checkRoomDatesMutation.data?.unavailableRooms?.map((room) => (
                <div className="flex items-center gap-2 pl-4" key={room.id}>
                  <p className="text-[6px] text-neutral-700">&#9679;</p>
                  <p className="text-sm text-neutral-700">{room.name}</p>
                  <p className="text-xs italic text-red-400">
                    ${room.price / 100}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      {(form.formState.errors.step3?.bookingCheckIn?.message ??
        form.formState.errors.step3?.bookingCheckOut?.message) && (
        <p className="w-full text-xs text-red-400">
          Please enter both the check in and check out dates.
        </p>
      )}
      {!!formValues.bookingCheckIn && formValues.bookingCheckOut && (
        <>
          <hr className="border-neutral-100" />
          {(() => {
            const calculatedStayInDays = calculateStayDuration(
              formValues.bookingCheckIn,
              formValues.bookingCheckOut,
            );

            return (
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full items-center justify-between">
                  <p className="text-sm text-neutral-700">Calculated stay:</p>
                  <p className="text-xs font-bold text-red-400">
                    {calculatedStayInDays}{" "}
                    {calculatedStayInDays > 1 ? "days" : "day"}
                  </p>
                </div>
                {cartTotal.isLoading && (
                  <Loader
                    label="Calculating total"
                    labelClassName="p-0"
                    containerClassName="p-0"
                    loaderClassName="w-3 h-3 p-0"
                  />
                )}
                {!cartTotal.isLoading && !cartTotal.isError && (
                  <div className="flex w-full items-center justify-between">
                    <p className="text-sm text-neutral-700">Total:</p>
                    <p className="text-xs font-bold text-red-400">
                      $
                      {(calculatedStayInDays * cartTotal.data.total).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
          <hr className="border-neutral-100" />
        </>
      )}
    </div>
  );
};

export const Step3 = ({ form, items }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <CheckRoomDates form={form} items={items} />
      <GuestInformationForm form={form} items={items} />
      {/* <pre>{JSON.stringify(form.watch("step3.guestInformation"), null, 2)}</pre> */}
    </div>
  );
};
