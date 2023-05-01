import { Product } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx, input }) => {
    const products = await ctx.prisma.product.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Debes escribir algo!")
          .max(100, "Maximo de 100 caracteres."),
        description: z.string(),
        imageUrl: z.string(),
        store: z.number(),
        prices: z.object({ price: z.number() }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          store: { connect: { id: input.store } },
          prices: { create: { price: input.prices.price } },
        },
      });
      return product;
    }),
});
