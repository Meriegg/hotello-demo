import type { Room } from "@prisma/client";

export const calculatePrices = (items: Room[], stayDuration: number) => {
  let baseRoomsPrice = 0;

  items.forEach((item) => {
    baseRoomsPrice += item.price;
  });

  const cartTotal = baseRoomsPrice * stayDuration;
  const reservationHold = Math.round((cartTotal / 100) * 25);

  return {
    baseRoomsPrice,
    cartTotal: {
      stripe: cartTotal,
      display: cartTotal / 100,
    },
    reservationHold: {
      stripe: reservationHold,
      display: reservationHold / 100,
    },
  };
};
