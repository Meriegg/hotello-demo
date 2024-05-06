import { db } from "../db";

export const checkRoomsAvailability = async (
  roomIds: string[],
  checkInDate: Date,
  checkOutDate: Date,
) => {
  let rooms = await db.room.findMany({
    where: {
      id: {
        in: roomIds,
      },
      isUnavailable: false,
      AND: [
        {
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
        },
      ],
      bookings: {
        some: {
          booking: {
            customerCheckOut: null,
            canceled: false,
          },
        },
      },
    },
    include: {
      bookings: {
        include: {
          booking: {
            select: {
              bookedCheckOut: true,
              bookedCheckIn: true,
            },
          },
        },
      },
    },
  });

  const areAllAvailable = rooms.length === roomIds.length;

  const unavailableRooms = areAllAvailable
    ? null
    : await db.room.findMany({
        where: {
          id: {
            in: roomIds.filter(
              (id) => rooms.findIndex((room) => room.id === id) === -1,
            ),
          },
        },
      });

  return { available: areAllAvailable, unavailableRooms };
};
