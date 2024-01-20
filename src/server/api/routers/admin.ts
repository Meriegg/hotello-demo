import { z } from "zod";
import { adminL0Procedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  getAnalyticsData: adminL0Procedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date().nullish().optional(),
      }),
    )
    .query(async ({ input: { startDate, endDate }, ctx: { db } }) => {
      const bookings = await db.booking.findMany({
        where: {
          createdOn: {
            gte: startDate,
            lte: endDate ?? new Date(),
          },
        },
      });

      const newUsers = await db.user.findMany({
        where: {
          createdOn: {
            gte: startDate,
            lte: endDate ?? new Date(),
          },
        },
      });

      const roomBookings = await db.bookingRoom.findMany({
        where: {
          booking: {
            createdOn: {
              gte: startDate,
              lte: endDate ?? new Date(),
            },
          },
        },
        include: {
          booking: true,
        },
      });

      const cancellationRate =
        (bookings.filter((booking) => booking.canceled).length /
          bookings.length) *
        100;
      const receivedRevenue = bookings.reduce(
        (total, booking) =>
          total + booking.paymentType === "FULL_UPFRONT"
            ? booking.baseRoomsPrice * booking.calculatedStayInDays
            : booking.reservationHoldPrice,
        0,
      );
      const revenueToReceive = bookings.reduce(
        (total, booking) => total + booking.priceToPayOnCheckIn,
        0,
      );
      const totalProjectedRevenue = receivedRevenue + revenueToReceive;

      const roomBookingsCount = new Map();

      roomBookings.forEach((booking) => {
        const currentCount =
          (roomBookingsCount.get(booking.roomId) as number) ?? 0;

        roomBookingsCount.set(booking.roomId, currentCount + 1);
      });

      const roomsKeyValue = Array.from(roomBookingsCount.keys()).map(
        (key: string) => `${key}:${roomBookingsCount.get(key)}`,
      );

      const bestSellerIds = roomsKeyValue
        .sort(
          (a, b) =>
            parseInt(b.split(":")[1] ?? "0") - parseInt(a.split(":")[1] ?? "0"),
        )
        .map((key) => key.split(":")[0] ?? "")
        .filter((id) => !!id)
        .slice(0, 2);

      const bestSellersDbData = await db.room.findMany({
        where: {
          id: {
            in: bestSellerIds,
          },
        },
      });

      const bestSellers = bestSellersDbData.map((room) => {
        const numOfBookings =
          roomsKeyValue
            .find((key) => key.split(":")[0] === room.id)
            ?.split(":")[1] ?? 0;

        return {
          roomData: room,
          numOfBookings,
        };
      });

      return {
        cancellationRate,
        receivedRevenue,
        revenueToReceive,
        totalProjectedRevenue,
        newUsersCount: newUsers.length,
        bestSellers,
        totalBookings: bookings.length,
        timeInterval: {
          startDate,
          endDate: endDate ?? new Date(),
        },
      };
    }),
});
