import { getPriceRange } from "~/lib/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { FilterDataValidator, FilterValidator } from "~/lib/zod/filter";
import { z } from "zod";
import type { Room, RoomCategory } from "@prisma/client";
import { checkRoomsAvailability } from "~/server/utils/check-rooms-availability";
import { TRPCError } from "@trpc/server";

export const roomsRouter = createTRPCRouter({
  getRooms: publicProcedure
    .input(
      z.object({
        filters: FilterValidator,
      }),
    )
    .query(async ({ ctx: { db }, input }) => {
      const checkInDate = input.filters.checkInDate;
      const checkOutDate = input.filters.checkOutDate;

      // eslint-disable-next-line
      let whereFilter: Record<any, any> = {};

      if (input?.filters?.priceRange?.length ?? 0 > 0) {
        whereFilter = {
          OR: [
            {
              price: {
                equals: input.filters.priceRange?.at(0),
              },
            },
            {
              price: {
                gt: input.filters.priceRange?.at(0),
                lt: !Number.isFinite(input.filters.priceRange?.at(1))
                  ? 100_000_000
                  : input.filters.priceRange?.at(1),
              },
            },
          ],
        };
      }

      if (input.filters.categories.length > 0) {
        whereFilter = {
          ...whereFilter,
          category: {
            name: {
              in: input.filters.categories,
            },
          },
        };
      }

      if (checkInDate && checkOutDate) {
        whereFilter = {
          ...whereFilter,
          NOT: {
            bookings: {
              some: {
                booking: {
                  OR: [
                    {
                      bookedCheckIn: {
                        lte: checkOutDate,
                      },
                      bookedCheckOut: {
                        gte: checkOutDate,
                      },
                    },
                    {
                      bookedCheckIn: {
                        lte: checkInDate,
                      },
                      bookedCheckOut: {
                        gte: checkInDate,
                      },
                    },
                    {
                      bookedCheckIn: {
                        gte: checkInDate,
                        lte: checkOutDate,
                      },
                    },
                  ],
                },
              },
            },
          },
        };
      }

      const rooms = await db.room.findMany({
        include: {
          category: true,
          bookings: {
            include: {
              booking: {
                select: {
                  bookedCheckIn: true,
                  bookedCheckOut: true,
                },
              },
            },
          },
        },
        where: {
          ...whereFilter,
          isUnavailable: false,
        },
      });

      type RoomWithCategory = Room & {
        category: RoomCategory;
      };

      const roomsByCategory: Record<string, RoomWithCategory[]> = {};

      rooms.forEach((room) => {
        if (!roomsByCategory[room.category.name]) {
          roomsByCategory[room.category.name] = [];
        }

        roomsByCategory[room.category.name]?.push(room);
      });

      return {
        rooms,
        roomsByCategory,
        roomsCategories: Object.keys(roomsByCategory),
      };
    }),
  getFilterData: publicProcedure.query(async ({ ctx: { db } }) => {
    const rooms = await db.room.findMany({
      include: {
        category: true,
      },
      where: {
        isUnavailable: false,
      },
    });

    const categories = [...new Set(rooms.map((room) => room.category.name))];

    const priceRanges = rooms
      .map(
        (room) =>
          getPriceRange(parseFloat(room.price.toString())).filter(
            (range) => !!range,
          )[0],
      )
      .filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o?.slug === obj?.slug),
      );

    return FilterDataValidator.parse({
      categories,
      priceRanges,
    });
  }),
  checkRoomsAvailability: publicProcedure
    .input(
      z.object({
        roomIds: z.string().array(),
        checkInDate: z.date(),
        checkOutDate: z.date(),
      }),
    )
    .mutation(async ({ input: { roomIds, checkOutDate, checkInDate } }) => {
      const data = await checkRoomsAvailability(
        roomIds,
        checkInDate,
        checkOutDate,
      );

      return data;
    }),
  getRoomCategories: publicProcedure.query(async ({ ctx: { db } }) => {
    return await db.roomCategory.findMany();
  }),
  getRoom: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const room = await db.room.findUnique({
        where: { id: input.roomId },
        include: { category: true },
      });
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This room does not exist.",
        });
      }

      return room;
    }),
});
