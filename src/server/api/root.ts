import { aiRouter } from "./routers/ai";
import { cartRouter } from "./routers/cart";
import { checkoutRouter } from "./routers/checkout";
import { roomsRouter } from "./routers/rooms";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  cart: cartRouter,
  ai: aiRouter,
  checkout: checkoutRouter,
});

export type AppRouter = typeof appRouter;
