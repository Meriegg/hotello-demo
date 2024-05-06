import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

import { db } from "~/server/db";
import { formatPlural } from "~/lib/utils";
import { RoomActions } from "./components/room-actions";

const Page = async () => {
  const rooms = await db.room.findMany({
    include: {
      category: true,
    },
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-neutral-700">All rooms</p>

        <Link
          href="/admin/rooms/new-room"
          className={buttonVariants({
            className:
              "transform gap-2 rounded-md !py-2 px-4 ring-red-100 !transition-all !duration-300 active:scale-95 active:ring-4",
          })}
        >
          Add new <PlusIcon className="h-4 w-4 text-inherit" />
        </Link>
      </div>

      <div className="flex w-full flex-col divide-y divide-neutral-100">
        {rooms.map((room, i) => (
          <div
            key={room.id}
            className="flex w-full flex-wrap items-center justify-between gap-4 py-2"
          >
            <div className="flex items-center gap-2">
              <img
                alt={`Room #${i + 1} display image`}
                src={room.images[0]}
                className="h-auto w-[100px] rounded-lg"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-neutral-900">
                  {room.name}
                </p>

                <div className="flex list-disc flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-red-400">
                    • ${room.price / 100}/night
                  </p>
                  <p className="text-xs font-bold text-red-400">
                    • {room.category.name}
                  </p>
                  <p className="text-xs font-bold text-neutral-700">
                    • Accommodates {room.accommodates}{" "}
                    {formatPlural(room.accommodates !== 1, "person", "people")}
                  </p>
                </div>
              </div>
            </div>

            <RoomActions room={room} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
