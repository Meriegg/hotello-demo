"use client";

import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import { RoomsFilter } from "./filter";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export const MobileFilter = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    parentRef?.current && autoAnimate(parentRef.current);
  }, [parentRef]);

  return (
    <div
      className="relative top-0 min-h-[53px] w-full border-b-[1px] border-neutral-100 md:hidden"
      ref={parentRef}
    >
      <p
        className={cn(
          "absolute top-0 transform p-4 text-xs font-bold text-neutral-700",
          isOpen ? "left-1/2 -translate-x-1/2" : "left-0",
        )}
        style={{
          transition: "position .3s ease, transform .8s ease",
        }}
      >
        filter
      </p>
      <button
        className={cn(
          "absolute right-0 rotate-0 transform p-4 text-neutral-900 transition-all duration-300",
          isOpen ? "top-full -translate-y-full -rotate-180" : "top-0",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronDown className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="mt-2 flex w-full flex-col gap-4 p-4 py-8 ">
          <RoomsFilter />
        </div>
      )}
    </div>
  );
};
