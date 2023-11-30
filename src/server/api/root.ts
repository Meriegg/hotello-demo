import { accountsRouter } from "./routers/account";
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
  account: accountsRouter,
});

export type AppRouter = typeof appRouter;
