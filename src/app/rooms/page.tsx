"use client";

import { api } from "~/trpc/react";
import { Footer } from "~/components/Footer";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { RoomsFilter } from "./components/filter";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";

const Page = () => {
  const filterOptions = useRoomsFilter();
  const { data: rooms, isLoading } = api.rooms.getRooms.useQuery(
    {
      filters: {
        categories: filterOptions.categories,
        priceRange: filterOptions.priceRange,
        selectedPrices: filterOptions.selectedPrices,
      },
    },
    {
      // @ts-ignore
      queryKey: ["rooms.getRooms", JSON.stringify(filterOptions)],
    },
  );

  return (
    <>
      <div className="border-b-[1px] border-neutral-100">
        <MaxWidthContainer className="flex min-h-[75px] flex-col items-start justify-center border-l-[1px] border-neutral-100 pl-6">
          <h1 className="text-2xl text-neutral-900">Here are our rooms!</h1>
          {/* <p className="text-sm text-neutral-700">12/12/2023 - 02/04/2024</p> */}
        </MaxWidthContainer>
      </div>
      <MaxWidthContainer className="flex min-h-screen items-start gap-2 border-l-[1px] border-neutral-100">
        <RoomsFilter />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <p>Rooms data</p>
            {JSON.stringify(filterOptions, null, 2)}
            <pre>{JSON.stringify(rooms, null, 2)}</pre>
          </div>
        )}
      </MaxWidthContainer>
      <Footer theme="light" />
    </>
  );
};

export default Page;
