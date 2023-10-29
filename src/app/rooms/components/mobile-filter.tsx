"use client";

import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import { RoomsFilter } from "./filter";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export const MobileFilter = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    parentRef?.current && autoAnimate(parentRef.current);
  }, [parentRef]);

  return (
    <div
      className="relative top-0 w-full md:hidden border-b-[1px] border-neutral-100 min-h-[55px]"
      ref={parentRef}
    >
      <p
        className={cn(
          "text-xs transition-all duration-300 text-neutral-700 font-bold absolute top-0 transform p-4",
          isOpen ? "left-1/2 -translate-x-1/2" : "left-0",
        )}
      >
        filter
      </p>
      <button
        className={cn(
          "text-neutral-900 transition-all duration-300 transform absolute right-0 p-4",
          isOpen ? "top-full -rotate-180 -translate-y-full" : "top-0",
        )}
        onClick={() => setOpen(!isOpen)}
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="flex mt-2 flex-col w-full p-4 py-8 gap-4 ">
          <RoomsFilter />
        </div>
      )}
    </div>
  );
};
