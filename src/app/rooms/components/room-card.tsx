import Link from "next/link";
import { Fragment } from "react";
import { RoomCardAddBtn } from "./room-card-addbtn";
import type { Room } from "@prisma/client";

interface Props {
  room: Room;
  category: string;
}

export const RoomCard = ({ room, category }: Props) => {
  const otherRoomKeys: string[] = Object.keys(room?.other ?? {});
  const otherVals = otherRoomKeys?.length > 0
    ? otherRoomKeys.map((key) =>
      (room.other as Record<string, string | { text: string; href: string }>)[
        key
      ] as string | { text: string; href: string }
    )
    : null;

  const roomDetails = [
    `$${room.price}/night`,
    `Accommodates ${room.accommodates} ${
      room.accommodates > 1 ? "people" : "person"
    }`,
    ...(otherVals ?? []),
  ];

  return (
    <div
      style={{ width: "min(350px, 100%)" }}
      className="h-auto bg-white flex flex-col gap-0 room-card-shadow-hover transition-all duration-300"
    >
      <div className="w-full min-h-[200px] bg-neutral-200">
      </div>
      <div className="p-4 flex flex-col justify-between gap-3 h-auto flex-1">
        <div className="flex flex-col gap-3">
          <p className="text-base text-neutral-900 font-bold">{room.name}</p>
          <div className="flex gap-2 items-start flex-wrap">
            {roomDetails.map((entry, i) => (
              <Fragment
                key={i}
              >
                {typeof entry === "string"
                  ? (
                    <p className="text-sm text-neutral-700 flex items-center gap-1">
                      <span className="text-[6px]">&#9679;</span> {entry}
                    </p>
                  )
                  : (
                    <Link
                      href={entry.href}
                      className="text-sm text-neutral-700 flex items-center gap-1 underline"
                    >
                      <span className="text-[6px]">&#9679;</span>
                      {entry.text}
                    </Link>
                  )}
              </Fragment>
            ))}
            <p className="text-sm flex items-center gap-1 text-red-400">
              <span className="text-[6px]">&#9679;</span> {category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full">
          <Link
            href={`/rooms/${room.id}`}
            className="text-xs text-red-400 hover:underline font-bold"
          >
            More details
          </Link>
          <RoomCardAddBtn productId={room.id} />
        </div>
      </div>
    </div>
  );
};
