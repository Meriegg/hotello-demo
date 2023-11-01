"use client";

import { useRef, useState } from "react";
import { CheckInOutDatePicker } from "~/components/ui/checkinout-date-picker";
import { Loader } from "~/components/ui/loader";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface Props {
  roomId: string;
}

export const CheckRoomAvailability = ({ roomId }: Props) => {
  const [state, setState] = useState<
    "idle" | "available" | "error" | "unavailable" | "loading"
  >("idle");

  const resetDatesRef = useRef<{ reset: (() => void) | null }>({ reset: null });

  const availability = api.rooms.checkRoomAvailability.useMutation(
    {
      onSuccess: (data) => {
        setState(data.available ? "available" : "unavailable");
      },
      onError: () => {
        setState("error");
      },
      onMutate: () => {
        setState("loading");
      },
    },
  );

  return (
    <div className="w-full flex flex-col gap-2">
      {state === "loading" &&
        (
          <p className="text-sm flex items-cetner gap-2 text-neutral-700">
            <Loader
              label={null}
              containerClassName="p-0 w-fit"
              labelClassName="p-0"
              loaderClassName="p-0"
            />{" "}
            Checking...
          </p>
        )}
      {state === "idle" &&
        <p className="text-sm text-neutral-700">Check availability</p>}
      {state === "available" &&
        <p className="text-neutral-900 text-sm">This room is available!</p>}
      {state === "unavailable" && (
        <div className="w-full flex items-center gap-1 text-sm text-red-400">
          <p className="text-neutral-900">This room is unavailable!</p>

          <button
            className="hover:underline"
            onClick={() => {
              setState("idle");

              if (resetDatesRef.current && resetDatesRef.current.reset) {
                resetDatesRef.current.reset();
              }
            }}
          >
            Try another date?
          </button>
        </div>
      )}

      <CheckInOutDatePicker
        className={cn(
          availability.isLoading && "opacity-60 cursor-not-allowed",
        )}
        onComplete={(checkIn, checkOut, reset) => {
          availability.mutate({
            checkOutDate: checkOut,
            checkInDate: checkIn,
            roomId,
          });

          resetDatesRef.current.reset = reset || null;
        }}
      />
    </div>
  );
};
