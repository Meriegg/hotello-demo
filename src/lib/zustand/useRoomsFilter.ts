import { z } from 'zod'
import type { TFilterValidator } from '../zod/filter';
import { create } from "zustand";

type PriceRange = [number, number];

interface UseRoomsFilter extends TFilterValidator {
  setPriceRange: (selectedPrices: PriceRange[]) => void;
  setCategories: (categories: string[]) => void;
  clearFilters: () => void;
}

export const useRoomsFilter = create<UseRoomsFilter>((set) => ({
  selectedPrices: [],
  priceRange: null,
  categories: [],
  setPriceRange: (selectedPrices) => {
    if (!selectedPrices.length) {
      return set({ priceRange: null, selectedPrices: [] })
    }

    const allPrices = selectedPrices.flat(2);
    const range = [Math.min(...allPrices), Math.max(...allPrices)];
    const finalRange = z.tuple([z.number(), z.number()]).parse(range)

    set(({ priceRange: finalRange, selectedPrices }))
  },
  setCategories: (categories) => set({ categories }),
  clearFilters: () => set({ priceRange: null, categories: [], selectedPrices: [] })
}));
