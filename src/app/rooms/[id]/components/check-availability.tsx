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
    <div ref={containerRef} className="w-full flex flex-col gap-2">
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
        (
          <p className="text-green-600 text-sm flex items-center gap-1">
            This room is available <Check className="w-3 h-3" />
          </p>
        )}
      {state === "unavailable" && (
        <div className="w-full flex items-center justify-between text-sm text-red-400">
          <p className="flex items-center gap-1">
            This room is unavailable <XIcon className="w-3 h-3" />
          </p>

          <button
            className="underline"
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
