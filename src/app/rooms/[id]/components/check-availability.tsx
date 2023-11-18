"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Check, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { CheckInOutDatePicker } from "~/components/ui/checkinout-date-picker";
import { Loader } from "~/components/ui/loader";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface Props {
  roomId: string;
}

export const CheckRoomAvailability = ({ roomId }: Props) => {
  const [containerRef] = useAutoAnimate();
  const [state, setState] = useState<
    "idle" | "available" | "error" | "unavailable" | "loading"
  >("idle");

  const resetDatesRef = useRef<{ reset: (() => void) | null }>({ reset: null });

  const availability = api.rooms.checkRoomsAvailability.useMutation({
    onSuccess: (data) => {
      setState(data.available ? "available" : "unavailable");
    },
    onError: () => {
      setState("error");
    },
    onMutate: () => {
      setState("loading");
    },
  });

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-2">
      {state === "loading" && (
        <p className="items-cetner flex gap-2 text-sm text-neutral-700">
          <Loader
            label={null}
            containerClassName="p-0 w-fit"
            labelClassName="p-0"
            loaderClassName="p-0"
          />{" "}
          Checking...
        </p>
      )}
      {state === "idle" && (
        <p className="text-sm text-neutral-700">Check availability</p>
      )}
      {state === "available" && (
        <p className="flex items-center gap-1 text-sm text-green-600">
          This room is available <Check className="h-3 w-3" />
        </p>
      )}
      {state === "unavailable" && (
        <div className="flex w-full items-center justify-between text-sm text-red-400">
          <p className="flex items-center gap-1">
            This room is unavailable <XIcon className="h-3 w-3" />
          </p>

          <button
            className="underline"
            onClick={() => {
              setState("idle");

              if (resetDatesRef.current?.reset) {
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
          availability.isLoading && "cursor-not-allowed opacity-60",
        )}
        onComplete={(checkIn, checkOut, reset) => {
          availability.mutate({
            checkOutDate: checkOut,
            checkInDate: checkIn,
            roomIds: [roomId],
          });

          resetDatesRef.current.reset = reset ?? null;
        }}
      />
    </div>
  );
};
