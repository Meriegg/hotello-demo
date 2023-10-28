import { getPriceRange } from "~/lib/utils";
import { createTRPCRouter, publicProcedure } from "../trpc"
import { FilterValidator, FilterDataValidator } from "~/lib/zod/filter";
import { z } from "zod";

export const roomsRouter = createTRPCRouter({
  getRooms: publicProcedure.input(z.object({
    filters: FilterValidator
  })).query(async ({ ctx: { db }, input }) => {
    let whereFilter: any = {}

    if (input?.filters?.priceRange?.length ?? 0 > 0) {
      whereFilter = {
        OR: [
          {
            price: {
              equals: input.filters.priceRange?.at(0)
            }
          },
          {
            price: {
              gt: input.filters.priceRange?.at(0),
              lt: input.filters.priceRange?.at(1)
            }
          }
        ]
      }
    }

    if (input.filters.categories.length > 0) {
      whereFilter = {
        ...whereFilter,
        category: {
          name: {
            in: input.filters.categories
          }
        }
      }
    }

    return await db.room.findMany({
      include: { category: true }, where: {
        ...whereFilter
      }
    })
  }),
  getFilterData: publicProcedure.query(async ({ ctx: { db } }) => {
    const rooms = await db.room.findMany({
      include: {
        category: true,
      },
    });

    const categories = [...new Set(rooms.map((room) => room.category.name))];

    const priceRanges = rooms.map((room) =>
      getPriceRange(room.price).filter((range) => !!range)[0]
    ).filter((obj, index, self) =>
      index === self.findIndex((o) => o?.slug === obj?.slug)
    );

    return FilterDataValidator.parse({
      categories,
      priceRanges,
    });
  }),
})