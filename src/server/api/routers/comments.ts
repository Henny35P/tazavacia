import { User } from "@clerk/nextjs/dist/server/clerk";
import { clerkClient } from "@clerk/nextjs/server";
import { Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profileImageUrl,
  };
};

export const commentsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx, input }) => {
    const comments = await ctx.prisma.comment.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });
    return ctx.prisma.comment.findMany();
  }),
  //   getPostsByUserId: publicProcedure
  //     .input(
  //       z.object({
  //         userId: z.string(),
  //       })
  //     )
  //     .query(({ ctx, input }) =>
  //       ctx.prisma.comment
  //         .findMany({
  //           where: {
  //             authorId: input.userId,
  //           },
  //           take: 100,
  //           orderBy: [{ createdAt: "desc" }],
  //         })
  //         .then(addUserDataToPosts)
  //     ),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Debes escribir algo!")
          .max(100, "Maximo de 100 caracteres."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const comment = await ctx.prisma.product.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return comment;
    }),
});
