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

  const roomDetails = [...(otherVals ?? [])];

  return (
    <>
      <MaxWidthContainer className="flex flex-col gap-8 px-4 py-8">
        <Link
          href="/rooms"
          className="flex w-fit items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 hover:underline"
        >
          <ChevronLeft className="h-5 w-5" /> Go Back
        </Link>

        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <ImageCarousel
            containerClassname="max-w-[500px] max-h-[300px] min-h-[300px]"
            images={room.images}
          />
          <div className="flex min-h-[300px] max-w-[450px] flex-col justify-between gap-2">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-neutral-700">{room.id}</p>
              <p className="text-2xl font-bold text-neutral-900">{room.name}</p>
              <p className="text-base font-bold text-red-400">
                ${room.price / 100}
                <span className="text-sm font-normal">/night</span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-start gap-2">
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
      <Footer theme="light" className="translate-y-full transform" />
    </>
  );
};

export default Page;
