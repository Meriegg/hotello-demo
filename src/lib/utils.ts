import { DefaultPriceRanges } from "../constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getPriceRange = (price: number) => {
  return DefaultPriceRanges.map((range) => {
    if (range.range[0] <= price && price <= range.range[1]) {
      return range;
    }
  });
};
