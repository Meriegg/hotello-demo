import { roomsRouter } from "./routers/rooms";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
});

export type AppRouter = typeof appRouter;
