import { api } from "~/trpc/server";
import { BookingDisplay } from "./booking-display";
import { getSession } from "../../../utils/get-page-session";
import { GhostIcon } from "lucide-react";

const Page = async () => {
  await getSession();
  const bookings = await api.account.getUserBookings.query();

  if (!bookings.length) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-8 text-center">
        <GhostIcon className="h-11 w-11 text-neutral-700" strokeWidth={1} />
        <p className="max-w-[450px] text-lg tracking-wide text-neutral-700">
          You do not have any bookings yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-2xl font-bold text-neutral-900">Your bookings</p>
      <div className="mt-4 flex w-full flex-wrap items-start gap-1">
        {bookings
          .sort((a, b) => b.createdOn.getTime() - a.createdOn.getTime())
          .map((booking) => (
            <BookingDisplay booking={booking} key={booking.id} />
          ))}
      </div>
    </div>
  );
};

export default Page;
