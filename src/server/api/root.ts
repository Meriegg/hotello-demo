import { cartRouter } from "./routers/cart";
import { roomsRouter } from "./routers/rooms";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
