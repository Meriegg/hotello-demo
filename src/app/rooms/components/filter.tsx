"use client";

import { api } from "~/trpc/react";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";
import { FilterCheckbox } from "./filter-checkbox";
import { CheckInOutDatePicker } from "~/components/ui/checkinout-date-picker";
import { Loader } from "~/components/ui/loader";

export const RoomsFilter = () => {
  const { selectedPrices, setPriceRange, setCategories, categories } =
    useRoomsFilter();
  const { isLoading, isError, data } = api.rooms.getFilterData.useQuery();

  return (
    <>
      {isLoading && <Loader label={null} />}
      {isError && <p>Error</p>}
      {data && !isLoading && !isError && (
        <>
          <p className="text-sm text-neutral-900">
            By Date
          </p>
          <CheckInOutDatePicker className="flex-col gap-4" />
          <p className="text-sm text-neutral-900">
            By price{" "}
            <span className="text-xs font-bold text-neutral-700">/night</span>
          </p>
          {data.priceRanges.map(({ range, slug }, i) => (
            <FilterCheckbox
              key={i}
              onCheckedChange={(checked) => {
                if (checked) {
                  setPriceRange([...selectedPrices, range]);
                } else {
                  setPriceRange([
                    ...selectedPrices.filter((pRange) => pRange !== range),
                  ]);
                }
              }}
              label={slug}
            />
          ))}

          <p className="text-sm text-neutral-900">By category</p>
          {data.categories.map((category, i) => (
            <FilterCheckbox
              key={i}
              onCheckedChange={(checked) => {
                if (checked) {
                  setCategories([...categories, category]);
                } else {
                  setCategories([
                    ...categories.filter((pCategory) => pCategory !== category),
                  ]);
                }
              }}
              label={category}
            />
          ))}
        </>
      )}
    </>
  );
};
