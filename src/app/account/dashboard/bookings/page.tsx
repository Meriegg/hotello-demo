import { api } from "~/trpc/server";
import { BookingDisplay } from "./booking-display";

const Page = async () => {
  const bookings = await api.account.getUserBookings.query();

  return (
    <div className="w-full">
      <p className="text-2xl font-bold text-neutral-900">Your bookings</p>
      <div className="mt-4 flex w-full flex-wrap items-start gap-1">
        {bookings
          .sort((a, b) => b.createdOn.getTime() - a.createdOn.getTime())
          .map((booking, i) => (
            <BookingDisplay booking={booking} key={i} />
          ))}
      </div>
    </div>
  );
};

export default Page;
