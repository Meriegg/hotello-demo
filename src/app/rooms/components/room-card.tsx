import Link from "next/link";
import { ImageCarousel } from "~/components/ui/image-carousel";
import type { Room } from "@prisma/client";
import { Fragment } from "react";
import { RoomCardAddBtn } from "./room-card-addbtn";
import { cn } from "~/lib/utils";

interface Props {
  room: Room;
  category: string;
  disabledCartBtn?: boolean;
  disabledMoreLink?: boolean;
}

export const RoomCard = ({
  room,
  category,
  disabledCartBtn = false,
  disabledMoreLink = false,
}: Props) => {
  const otherRoomKeys: string[] = Object.keys(room?.other ?? {});
  const otherVals =
    otherRoomKeys?.length > 0
      ? otherRoomKeys.map(
          (key) =>
            (
              room.other as Record<
                string,
                string | { text: string; href: string }
              >
            )[key] as string | { text: string; href: string },
        )
      : null;

  const roomDetails = [
    `$${room.price / 100}/night`,
    `Accommodates ${room.accommodates} ${
      room.accommodates > 1 ? "people" : "person"
    }`,
    ...(otherVals ?? []),
  ];

  return (
    <div
      style={{ width: "min(350px, 100%)" }}
      className="room-card-shadow-hover flex h-auto flex-col gap-0 bg-white transition-all duration-300"
    >
      <ImageCarousel
        images={room.images}
        containerClassname="max-h-[200px] min-h-[200px]"
      />
      <div className="flex h-auto flex-1 flex-col justify-between gap-3 p-4">
        <div className="flex flex-col gap-3">
          <p className="text-base font-bold text-neutral-900">{room.name}</p>
          <div className="flex flex-wrap items-start gap-2">
            {roomDetails.map((entry, i) => (
              <Fragment key={i}>
                {typeof entry === "string" ? (
                  <p className="flex items-center gap-1 text-sm text-neutral-700">
                    <span className="text-[6px]">&#9679;</span> {entry}
                  </p>
                ) : (
                  <Link
                    href={entry.href}
                    className="flex items-center gap-1 text-sm text-neutral-700 underline"
                  >
                    <span className="text-[6px]">&#9679;</span>
                    {entry.text}
                  </Link>
                )}
              </Fragment>
            ))}
            <p className="flex items-center gap-1 text-sm text-red-400">
              <span className="text-[6px]">&#9679;</span> {category}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <Link
            href={`/rooms/${room.id}`}
            className={cn(
              "text-xs font-bold text-red-400 hover:underline",
              disabledMoreLink && "pointer-events-none",
            )}
          >
            More details
          </Link>
          <RoomCardAddBtn disabled={disabledCartBtn} productId={room.id} />
        </div>
      </div>
    </div>
  );
};
