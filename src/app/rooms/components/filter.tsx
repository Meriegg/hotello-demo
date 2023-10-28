"use client";

import { api } from "~/trpc/react";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";
import { FilterCheckbox } from "./filter-checkbox";

export const RoomsFilter = () => {
  const { selectedPrices, setPriceRange, setCategories, categories } =
    useRoomsFilter();
  const { isLoading, data } = api.rooms.getFilterData.useQuery();

  if (isLoading || !data) {
    return <p>Loading..</p>;
  }

  return (
    <div className="flex h-[500px] w-[250px] flex-col gap-2 border">
      <p>By price</p>
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

      <p>By category</p>
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
    </div>
  );
};
