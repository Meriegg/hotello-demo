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
import { Ghost } from "lucide-react";
import autoAnimate from "@formkit/auto-animate";
import { FilterChips } from "~/components/FilterChips";

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
      // eslint-disable-next-line
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
          <FilterChips />
          {/* <p className="text-sm text-neutral-700">12/12/2023 - 02/04/2024</p> */}
        </MaxWidthContainer>
      </div>
      <MaxWidthContainer
        ref={parent}
        className="flex min-h-screen flex-col items-start gap-8 border-l-[1px] border-neutral-100 md:flex-row"
      >
        <DesktopFilter />
        <MobileFilter />
        {rooms?.rooms.length <= 0
          ? (
            <div className="flex text-center w-full flex-col justify-center items-center gap-4 py-8">
              <Ghost className="h-11 w-11 text-neutral-700" strokeWidth={1} />
              <p className="text-neutral-700 text-lg tracking-wide max-w-[450px]">
                We are sorry but we don't have any rooms that meet your
                criteria.
              </p>
            </div>
          )
          : null}
        {isLoading && <Loader />}
        {!isLoading && rooms?.rooms?.length > 0 && (
          <div className="mx-auto flex w-full max-w-[800px] flex-col gap-24 px-4 py-8">
            {rooms.roomsCategories.map((category, i) => (
              <div className="flex flex-col gap-6" key={i}>
                <div className="flex w-full items-center justify-between">
                  <p className="flex items-center gap-2 text-base text-neutral-700 md:text-2xl">
                    <span className="text-[6px] md:text-[10px]">&#9679;</span>
                    {" "}
                    {category}
                  </p>
                </div>
                <div className="flex w-full flex-wrap justify-evenly gap-8 lg:justify-between">
                  {rooms.roomsByCategory[category]?.map((room, i) => (
                    <RoomCard
                      room={room}
                      category={room.category.name}
                      key={i}
                    />
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
