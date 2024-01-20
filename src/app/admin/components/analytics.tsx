"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Loader } from "~/components/ui/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { formatPlural } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Calendar } from "~/components/ui/calendar";
import { Skeleton } from "~/components/ui/skeleton";

const Entry = ({
  value,
  label,
  helpTooltip,
}: {
  value: string;
  label: string;
  helpTooltip?: string;
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-neutral-50 p-4">
      <p className="text-sm text-neutral-700">{label}</p>
      <p className="text-4xl font-semibold text-red-400">{value}</p>
    </div>
  );
};

export const Analytics = () => {
  const begginingOfCurrentMonthDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const [startDate, setStartDate] = useState(begginingOfCurrentMonthDate);
  const [endDate, setEndDate] = useState(new Date());

  const { isLoading, isError, data } = api.admin.getAnalyticsData.useQuery({
    startDate,
    endDate,
  });

  if (isError) {
    return <p>An error happened</p>;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger>
            <button className="flex items-center gap-2 rounded-md bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900">
              Date picker <CalendarIcon className="h-3 w-3 text-inherit" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={1}
              selected={{
                from: startDate,
                to: endDate ?? new Date(),
              }}
              onSelect={(date) => {
                if (date?.from) setStartDate(date.from);
                if (date?.to) setEndDate(date.to);
              }}
            />
          </PopoverContent>
        </Popover>

        <p className="flex w-fit items-center gap-2 rounded-md bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
          Showing data for{" "}
          {isLoading && (
            <Loader
              label={null}
              containerClassName="w-fit p-0"
              labelClassName="w-fit p-0"
              loaderClassName="w-fit p-0"
            />
          )}
          {!isLoading && !isError && (
            <span className="font-bold text-neutral-900">
              {new Intl.DateTimeFormat().format(data.timeInterval.startDate)} -{" "}
              {new Intl.DateTimeFormat().format(data.timeInterval.endDate)}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-start gap-4">
        {isLoading && (
          <>
            {Array.from(new Array(5)).map((_, i) => (
              <Skeleton key={i} className="h-[100px] w-[250px] rounded-md" />
            ))}
          </>
        )}

        {!isLoading && !isError && (
          <>
            <Entry
              label="Received revenue"
              value={`$${data.receivedRevenue / 100}`}
            />

            <Entry
              label="Revenue to receive (on check-in)"
              value={`$${data.revenueToReceive / 100}`}
            />

            <Entry
              label="Total projected revenue"
              value={`$${data.totalProjectedRevenue / 100}`}
            />

            <Entry
              label="Total bookings"
              value={`${data.totalBookings} ${formatPlural(
                data.totalBookings !== 1,
                "booking",
                "bookings",
              )}`}
            />

            <Entry
              label="Cancellation rate"
              value={`${data.cancellationRate.toFixed(2)}%`}
            />

            <Entry
              label="New users"
              value={`${data.newUsersCount} new ${formatPlural(
                data.newUsersCount !== 1,
                "user",
                "users",
              )}`}
            />
          </>
        )}
      </div>

      <hr className="border-neutral-100 my-2" />

      <p className="flex items-center gap-2 text-2xl font-bold text-neutral-700">
        {isLoading && (
          <Loader
            label={null}
            containerClassName="w-fit p-0"
            labelClassName="w-fit p-0"
            loaderClassName="w-fit p-0"
          />
        )}{" "}
        Best sellers
      </p>

      <div className="flex flex-col gap-4 md:flex-row mt-2">
        {isLoading && (
          <>
            <Skeleton className="h-[60px] w-full rounded-md" />
            <Skeleton className="h-[60px] w-full rounded-md" />
          </>
        )}
        {!isLoading && !isError && (
          <>
            {data.bestSellers.map((room, i) => (
              <div
                key={room.roomData.id}
                className="flex w-full items-center gap-4 justify-between"
              >
                <div className="flex items-center w-auto gap-2">
                  <img
                    src={room.roomData.images[0]}
                    alt={`Best seller ${i + 1} display image`}
                    className="h-[55px] w-auto rounded-md"
                  />

                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-neutral-700">
                      {room.roomData.name}
                    </p>
                    <p className="text-xs font-bold text-red-400">
                      ${room.roomData.price / 100}/night
                    </p>
                  </div>
                </div>

                <div className="flex flex-col min-w-fit items-end">
                  <p className="text-xs text-neutral-700">
                    <span className="text-base font-bold text-red-400">{room.numOfBookings}</span>{" "}
                    {formatPlural(
                      room.numOfBookings !== 1,
                      "booking",
                      "bookings",
                    )}
                  </p>
                  <p className="text-xs text-neutral-700">
                    <span className="text-red-400 font-bold text-base">${(parseInt(room.numOfBookings.toString()) * room.roomData.price) / 100}</span> est. revenue
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};
