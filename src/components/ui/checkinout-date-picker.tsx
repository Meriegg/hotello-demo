"use client";

import { useEffect, useState } from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CornerUpLeft, CornerUpRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";

const DateDisplay = ({
  selected,
  label,
}: {
  selected?: Date;
  label: JSX.Element;
}) => {
  return (
    <div className="relative flex h-[50px] w-full items-center justify-center border-[1px] border-neutral-100">
      {selected ? (
        <p className="text-xs text-neutral-900">
          {new Intl.DateTimeFormat().format(selected)}
        </p>
      ) : null}
      <p
        className={cn(
          "absolute flex transform items-center justify-center gap-2 p-1 text-xs text-neutral-700 transition-all duration-300",
          !selected
            ? "left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 scale-100"
            : "-left-2 -top-3 w-fit scale-75 bg-white",
        )}
      >
        {label}
      </p>
    </div>
  );
};

interface Props {
  className?: string;
  onComplete?: (checkIn: Date, checkOut: Date, reset?: () => void) => void;
  onChange?: (checkIn?: Date, checkOut?: Date, reset?: () => void) => void;
  preserveFilterState?: boolean;
}

export const CheckInOutDatePicker = ({
  className,
  onComplete,
  onChange,
  preserveFilterState,
}: Props) => {
  const filter = useRoomsFilter();

  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();

  const [cInOpen, setCInOpen] = useState(false);
  const [cOutOpen, setCOutOpen] = useState(false);

  const reset = () => {
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
  };

  useEffect(() => {
    if (preserveFilterState) {
      setCheckOutDate(filter.checkOutDate!);
      setCheckInDate(filter.checkInDate!);
    }
  }, []);

  useEffect(() => {
    if (checkInDate && checkOutDate && onComplete) {
      onComplete(checkInDate, checkOutDate, reset);
    }

    if (onChange) {
      onChange(checkInDate, checkOutDate, reset);
    }
  }, [checkInDate, checkOutDate]);

  return (
    <div className={cn("flex w-full flex-wrap", className)}>
      <Popover open={cInOpen} onOpenChange={setCInOpen}>
        <PopoverTrigger className="h-auto flex-1">
          <DateDisplay
            label={
              <>
                <CornerUpRight className="h-3 w-3" />
                When are you arriving?
              </>
            }
            selected={checkInDate}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={checkInDate}
            onSelect={(date) => {
              if (checkOutDate && date && date >= checkOutDate) {
                return;
              }

              setCInOpen(false);
              setCOutOpen(true);
              setCheckInDate(date);
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover open={cOutOpen} onOpenChange={setCOutOpen}>
        <PopoverTrigger className="h-auto flex-1">
          <DateDisplay
            label={
              <>
                <CornerUpLeft className="h-3 w-3" />
                When are you leaving?
              </>
            }
            selected={checkOutDate}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={checkOutDate}
            onSelect={(date) => {
              if (checkInDate && date && date <= checkInDate) {
                return;
              }

              setCOutOpen(false);
              setCheckOutDate(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
