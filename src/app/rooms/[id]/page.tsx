import Link from "next/link";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { MaxWidthContainer } from "~/components/MaxWidthContainer";
import { ChevronLeft } from "lucide-react";
import { Fragment } from "react";
import { RoomCardAddBtn } from "../components/room-card-addbtn";
import { CheckRoomAvailability } from "./components/check-availability";
import { Footer } from "~/components/Footer";
import { ImageCarousel } from "~/components/ui/image-carousel";

const Page = async ({ params: { id: roomId } }: { params: { id: string } }) => {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { category: true },
  });
  if (!room) {
    return notFound();
  }

  const otherRoomKeys: string[] = Object.keys(room?.other ?? {});
  const otherVals = otherRoomKeys?.length > 0
    ? otherRoomKeys.map((key) =>
      (room.other as Record<string, string | { text: string; href: string }>)[
        key
      ] as string | { text: string; href: string }
    )
    : null;

  const roomDetails = [
    ...(otherVals ?? []),
  ];

  return (
    <>
      <MaxWidthContainer className="py-8 flex flex-col gap-8 px-4">
        <Link
          href="/rooms"
          className="flex w-fit items-center gap-2 text-sm text-neutral-700 hover:underline hover:text-neutral-900"
        >
          <ChevronLeft className="w-5 h-5" /> Go Back
        </Link>

        <div className="flex lg:flex-row flex-col items-center gap-8">
          <ImageCarousel
            containerClassname="max-w-[500px] max-h-[300px]"
            images={room.images}
          />
          <div className="flex flex-col justify-between min-h-[300px] gap-2 max-w-[450px]">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-neutral-700">{room.id}</p>
              <p className="text-neutral-900 text-2xl font-bold">
                {room.name}
              </p>
              <p className="text-base text-red-400 font-bold">
                ${room.price.toString()}
                <span className="font-normal text-sm">/night</span>
              </p>
            </div>

            <div className="flex gap-2 items-start flex-wrap mt-4">
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
                <span className="text-[6px]">&#9679;</span> {room.category.name}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <CheckRoomAvailability roomId={room.id} />

              <RoomCardAddBtn productId={room.id} />
            </div>
          </div>
        </div>
      </MaxWidthContainer>
      <Footer theme="light" className="transform translate-y-full" />
    </>
  );
};

export default Page;
