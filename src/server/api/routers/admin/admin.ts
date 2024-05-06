import { z } from "zod";
import {
  adminL0Procedure,
  adminL2Procedure,
  adminL3Procedure,
  createTRPCRouter,
} from "../../trpc";
import { adminBookingActions } from "./booking-actions";
import { RoomValidationSchema } from "~/lib/zod/admin";
import { stripe } from "~/lib/stripe";
import { TRPCError } from "@trpc/server";

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
  getUploadedImages: adminL0Procedure.query(async ({ ctx: { db } }) => {
    return await db.uploadedImage.findMany({
      include: {
        uploadedBy: true,
      },
    });
  }),
  createRoom: adminL3Procedure
    .input(RoomValidationSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const newRoom = await db.room.create({
        data: {
          name: input.name,
          hasSpecialNeeds: input.hasSpecialNeeds,
          price: input.price * 100,
          other: input.otherAttributes,
          images: input.images,
          categoryId: input.category,
          accommodates: input.accommodates,
        },
      });

      return newRoom;
    }),
  updateRoom: adminL3Procedure
    .input(RoomValidationSchema.extend({ roomId: z.string() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const updatedRoom = await db.room.update({
        where: {
          id: input.roomId,
        },
        data: {
          categoryId: input.category,
          name: input.name,
          other: input.otherAttributes,
          price: input.price * 100,
          images: input.images,
          updatedOn: new Date(),
          accommodates: input.accommodates,
          hasSpecialNeeds: input.hasSpecialNeeds,
        },
      });

      return updatedRoom;
    }),
  setRoomAvailability: adminL3Procedure
    .input(z.object({ isUnavailable: z.boolean(), roomId: z.string() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const updatedRoom = await db.room.update({
        where: {
          id: input.roomId,
        },
        data: {
          isUnavailable: input.isUnavailable,
        },
      });

      return updatedRoom;
    }),
  getBooking: adminL2Procedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx: { db }, input: { bookingId } }) => {
      const booking = await db.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          rooms: {
            include: {
              guestDetails: true,
              room: true,
            },
          },
          otherServiceEntries: true,
        },
      });
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This booking does not exist.",
        });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        booking.paymentIntentId,
      );

      return {
        ...booking,
        totalPaid: paymentIntent.amount,
      };
    }),
  bookingActions: adminBookingActions,
});
