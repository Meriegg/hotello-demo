"use client";

import { useEffect, useState } from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CornerUpLeft, CornerUpRight } from "lucide-react";
import { cn } from "~/lib/utils";

const DateDisplay = (
  { selected, label }: { selected?: Date; label: JSX.Element },
) => {
  return (
    <div className="relative h-[50px] w-full flex items-center justify-center border-[1px] border-neutral-100">
      {selected
        ? (
          <p className="text-xs text-neutral-900">
            {new Intl.DateTimeFormat().format(selected)}
          </p>
        )
        : null}
      <p
        className={cn(
          "text-xs text-neutral-700 transform transition-all duration-300 flex items-center justify-center gap-2 absolute p-1",
          !selected
            ? "left-1/2 top-1/2 -translate-x-1/2 scale-100 w-full -translate-y-1/2"
            : "-left-2 -top-3 w-fit bg-white scale-75",
        )}
      >
        {label}
      </p>
    </div>
  );
};

interface Props {
  className?: string;
  onComplete?: (checkIn: Date, checkOut: Date) => void;
  onChange?: (checkIn?: Date, checkOut?: Date) => void;
}

export const CheckInOutDatePicker = (
  { className, onComplete, onChange }: Props,
) => {
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();

  useEffect(() => {
    if (checkInDate && checkOutDate && onComplete) {
      onComplete(checkInDate, checkOutDate);
    }

    if (onChange) {
      onChange(checkInDate, checkOutDate);
    }
  }, [checkInDate, checkOutDate]);

  return (
    <div className={cn("flex flex-wrap w-full", className)}>
      <Popover>
        <PopoverTrigger
          className="flex-1 h-auto"
          onSelect={(e) => console.log(e)}
        >
          <DateDisplay
            label={
              <>
                <CornerUpRight className="w-3 h-3" />
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

              setCheckInDate(date);
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger className="flex-1 h-auto">
          <DateDisplay
            label={
              <>
                <CornerUpLeft className="w-3 h-3" />
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

              setCheckOutDate(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
