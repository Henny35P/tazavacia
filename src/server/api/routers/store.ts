import { Store } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const storeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const stores = await ctx.prisma.store.findMany({
      take: 100,
    });
    return stores;
  }),
});
