import { createTRPCRouter } from "~/server/api/trpc";
import { productRouter } from "./routers/products";
import { commentsRouter } from "./routers/comments";
import { storeRouter } from "./routers/store";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  products: productRouter,
  comments: commentsRouter,
  store: storeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
