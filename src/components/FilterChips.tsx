import { XIcon } from "lucide-react";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const FilterChips = () => {
  const [containerRef] = useAutoAnimate();
  const filterOptions = useRoomsFilter();
  const items = [
    {
      label: null,
      text: (!!filterOptions.checkOutDate || !!filterOptions.checkInDate)
        ? `${
          !!filterOptions.checkInDate
            ? `in: ${
              new Intl.DateTimeFormat().format(
                filterOptions.checkInDate,
              )
            }`
            : ""
        } ${
          (!!filterOptions.checkInDate && !!filterOptions.checkOutDate)
            ? "-"
            : ""
        } ${
          !!filterOptions.checkOutDate
            ? `out: ${
              new Intl.DateTimeFormat().format(
                filterOptions.checkOutDate,
              )
            }`
            : ""
        }`
        : null,
      removeFunc: () => {
        filterOptions.setDates(null, null);

        if (!!filterOptions.resetDates) {
          filterOptions.resetDates();
        }
      },
    },
    ...filterOptions.categories.map((category) => ({
      label: "category:",
      text: category,
      removeFunc: () => {
        filterOptions.setCategories(
          [...filterOptions.categories.filter((c) => c !== category)],
        );
      },
    })),
    ...filterOptions.selectedPrices.map((pRange) => ({
      label: "price range:",
      text: `$${pRange[0]} - $${pRange[1]}`,
      removeFunc: () => {
        filterOptions.setPriceRange([
          ...filterOptions.selectedPrices.filter((prevPRange) =>
            prevPRange !== pRange
          ),
        ]);
      },
    })),
  ].filter((item) => item.text !== null);

  return (
    <div
      className="flex items-center flex-wrap w-full gap-2"
      ref={containerRef}
    >
      {items.map((chip) => (
        <div className="text-xs px-2 rounded-md py-1 bg-neutral-50 text-neutral-700 flex items-center gap-2">
          <p>{chip.label && <span>{chip.label}</span>} {chip.text}</p>
          <button onClick={chip.removeFunc}>
            <XIcon className="w-3 h-3 text-neutral-900" />
          </button>
        </div>
      ))}
    </div>
  );
};
