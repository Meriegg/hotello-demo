import { api } from "~/trpc/server";
import { BookingDisplay } from "./booking-display";

const Page = async () => {
  const bookings = await api.account.getUserBookings.query();

  return (
    <div>
      <p>Your bookings</p>
      {bookings.map((booking, i) => (
        <BookingDisplay
          booking={booking}
          key={i}
        />
      ))}
    </div>
  );
};

export default Page;
