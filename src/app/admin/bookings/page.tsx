import { db } from "~/server/db";
import { CalendarView } from "./calendar-view";

const Page = async () => {
  const allBookings = await db.booking.findMany({
    where: {
      canceled: false,
      customerCheckOut: null,
      paymentStatus: "PAID",
    },
    include: {
      rooms: {
        include: {
          room: true,
        },
      },
    },
  });

  const missedBookings: typeof allBookings = [];

  allBookings.forEach((booking) => {
    const currDate = new Date().getTime();
    const bookDate = booking.bookedCheckOut.getTime();

    if (currDate > bookDate && !booking.customerCheckIn) {
      missedBookings.push(booking);
    }
  });

  if (missedBookings.length > 0) {
    await db.booking.updateMany({
      where: {
        id: {
          in: missedBookings.map((booking) => booking.id),
        },
      },
      data: {
        fulfillmentStatus: "MISSED",
      },
    });
  }

  return (
    <div>
      <CalendarView bookings={allBookings} />
    </div>
  );
};

export default Page;
