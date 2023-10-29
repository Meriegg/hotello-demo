"use client";

import { api } from "~/trpc/react";
import { Footer } from "~/components/Footer";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { useRoomsFilter } from "~/lib/zustand/useRoomsFilter";
import { RoomCard } from "./components/room-card";
import { Loader } from "~/components/ui/loader";
import { DesktopFilter } from "./components/desktop-filter";
import { MobileFilter } from "./components/mobile-filter";
import { useEffect, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const Page = () => {
  const parent = useRef<HTMLDivElement>(null);
  const filterOptions = useRoomsFilter();
  const { data: rooms, isLoading } = api.rooms.getRooms.useQuery(
    {
      filters: {
        categories: filterOptions.categories,
        priceRange: filterOptions.priceRange,
        selectedPrices: filterOptions.selectedPrices,
        checkOutDate: filterOptions.checkOutDate,
        checkInDate: filterOptions.checkInDate,
      },
    },
    {
      // @ts-ignore
      queryKey: ["rooms.getRooms", JSON.stringify(filterOptions)],
    },
  );

  useEffect(() => {
    parent?.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <>
      <div className="border-b-[1px] border-neutral-100">
        <MaxWidthContainer className="flex min-h-[90px] flex-col items-start justify-center border-l-[1px] border-neutral-100 pl-6">
          <h1 className="text-2xl text-neutral-900">Here are our rooms!</h1>
          {/* <p className="text-sm text-neutral-700">12/12/2023 - 02/04/2024</p> */}
        </MaxWidthContainer>
      </div>
      <MaxWidthContainer
        ref={parent}
        className="flex flex-col md:flex-row min-h-screen items-start gap-8 border-l-[1px] border-neutral-100"
      >
        <DesktopFilter />
        <MobileFilter />
        {isLoading
          ? <Loader />
          : (
            <div className="w-full max-w-[800px] mx-auto py-8 px-4 flex flex-col gap-24">
              {rooms.roomsCategories.map((category) => (
                <div className="flex flex-col gap-6">
                  <div className="w-full flex items-center justify-between">
                    <p className="text-base md:text-2xl text-neutral-700 flex items-center gap-2">
                      <span className="text-[6px] md:text-[10px]">&#9679;</span>
                      {" "}
                      {category}
                    </p>
                  </div>
                  <div className="w-full flex justify-evenly gap-8 lg:justify-between flex-wrap">
                    {rooms.roomsByCategory[category]?.map((room) => (
                      <RoomCard room={room} category={room.category.name} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </MaxWidthContainer>
      <Footer theme="light" />
    </>
  );
};

export default Page;
