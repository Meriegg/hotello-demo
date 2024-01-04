import { api } from "~/trpc/server";
import { BookingDisplay } from "./booking-display";

const Page = async () => {
  const bookings = await api.account.getUserBookings.query();

  return (
    <div className="w-full">
      <p className="text-2xl font-bold text-neutral-900">Your bookings</p>
      <div className="flex items-start flex-wrap gap-4 mt-4 w-full">
        {bookings.map((booking, i) => (
          <BookingDisplay
            booking={booking}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
