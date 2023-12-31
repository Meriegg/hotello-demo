import { z } from "zod";
import type { TFilterValidator } from "../zod/filter";
import { create } from "zustand";

type PriceRange = [number, number];

interface UseRoomsFilter extends TFilterValidator {
  setPriceRange: (selectedPrices: PriceRange[]) => void;
  setCategories: (categories: string[]) => void;
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  clearFilters: () => void;
  resetDates: (() => void) | null;
  setResetDates: (val: (() => void) | null) => void;
}

export const useRoomsFilter = create<UseRoomsFilter>((set) => ({
  priceRange: null,
  selectedPrices: [],
  categories: [],
  checkInDate: null,
  checkOutDate: null,
  resetDates: null,
  setPriceRange: (selectedPrices) => {
    if (!selectedPrices.length) {
      return set({ priceRange: null, selectedPrices: [] });
    }

    const allPrices = selectedPrices.flat(2);
    const range = [Math.min(...allPrices), Math.max(...allPrices)];
    const finalRange = z.tuple([z.number(), z.number()]).parse(range);

    set({ priceRange: finalRange, selectedPrices });
  },
  setDates: (checkIn, checkOut) =>
    set({ checkInDate: checkIn, checkOutDate: checkOut }),
  setCategories: (categories) => set({ categories }),
  setResetDates: (func) => set({ resetDates: func }),
  clearFilters: () =>
    set({
      priceRange: null,
      categories: [],
      checkInDate: null,
      checkOutDate: null,
      selectedPrices: [],
    }),
}));
