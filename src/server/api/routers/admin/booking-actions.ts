import { z } from "zod";
import { adminL1Procedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const adminBookingActions = createTRPCRouter({
  addOtherService: adminL1Procedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string().optional(),
        bookingId: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx: { db },
        input: { name, price, description, bookingId },
      }) => {
        const booking = await db.booking.findUnique({
          where: {
            id: bookingId,
          },
          include: {
            otherServiceEntries: true,
          },
        });
        if (!booking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This booking does not exist.",
          });
        }

        const newService = await db.bookingOtherService.create({
          data: {
            name,
            price: price * 100,
            description: description,
            bookingId,
          },
        });

        let newTotal = booking.otherServiceEntries.reduce(
          (prev, curr) => prev + curr.price,
          0,
        );
        newTotal += price * 100;

        await db.booking.update({
          where: {
            id: bookingId,
          },
          data: {
            otherServicesPrice: newTotal,
          },
        });

        return newService;
      },
    ),
  removeOtherService: adminL1Procedure
    .input(
      z.object({
        bookingId: z.string(),
        entryId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db }, input: { bookingId, entryId } }) => {
      const booking = await db.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          otherServiceEntries: true,
        },
      });
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This booking does not exist.",
        });
      }

      const removedService = await db.bookingOtherService.delete({
        where: {
          id: entryId,
        },
      });

      const newTotal = booking.otherServiceEntries
        .filter((entry) => entry.id !== entryId)
        .reduce((prev, entry) => prev + entry.price, 0);

      await db.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          otherServicesPrice: newTotal,
        },
      });

      return removedService;
    }),
  markCustomerAsCheckedIn: adminL1Procedure
    .input(
      z.object({
        bookingId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db }, input: { bookingId } }) => {
      const booking = await db.booking.findUnique({
        where: {
          id: bookingId,
        },
      });
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This booking does not exist.",
        });
      }
      if (booking.canceled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking is canceled.",
        });
      }
      if (booking.customerCheckIn) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Customer already checked in.",
        });
      }
      if (booking.customerCheckOut && booking.customerCheckIn) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking already fulfilled.",
        });
      }
      if (booking.fulfillmentStatus === "MISSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot check in customer as they missed their booking.",
        });
      }

      const today = new Date();

      // Compare year, month, and day
      const isEearly =
        today.getFullYear() < booking.bookedCheckIn.getFullYear() ||
        today.getMonth() < booking.bookedCheckIn.getMonth() ||
        today.getDate() < booking.bookedCheckIn.getDate();

      if (isEearly) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot check in customer early.",
        });
      }

      const isMissed = new Date().getTime() > booking.bookedCheckOut.getTime();
      if (isMissed) {
        await db.booking.update({
          where: {
            id: bookingId,
          },
          data: {
            fulfillmentStatus: "MISSED",
          },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot check in customer as they missed their booking.",
        });
      }

      const isCustomerLate =
        new Date().getTime() > booking.bookedCheckIn.getTime();

      const updatedBooking = await db.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          customerCheckIn: new Date(),
          fulfillmentStatus: isCustomerLate
            ? "CUSTOMER_CHECKED_IN_LATE"
            : "CUSTOMER_CHECKED_IN_ON_TIME",
        },
      });

      return { updatedBooking };
    }),
  markCustomerAsCheckedOut: adminL1Procedure
    .input(
      z.object({
        bookingId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db }, input: { bookingId } }) => {
      const booking = await db.booking.findUnique({
        where: {
          id: bookingId,
        },
      });
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This booking does not exist.",
        });
      }
      if (!booking.customerCheckIn) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer did not check in.",
        });
      }
      if (!!booking.customerCheckOut) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Customer already checked out.",
        });
      }

      const today = new Date();

      // Compare year, month, and day
      const isEarly =
        today.getFullYear() < booking.bookedCheckOut.getFullYear() ||
        today.getMonth() < booking.bookedCheckOut.getMonth() ||
        today.getDate() < booking.bookedCheckOut.getDate();

      const updatedBooking = await db.booking.update({
        data: {
          customerCheckOut: new Date(),
          fulfillmentStatus: isEarly
            ? "CUSTOMER_CHECKED_OUT_EARLY"
            : "CUSTOMER_CHECKED_OUT_ON_TIME",
        },
        where: {
          id: bookingId,
        },
      });

      return { updatedBooking };
    }),
});
