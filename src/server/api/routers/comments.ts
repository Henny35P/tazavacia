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

const addUserDataToComments = async (comments: Comment[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: comments.map((comment) => comment.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return comments.map((comment) => {
    const author = users.find((user) => user.id === comment.authorId);
    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author not found",
      });

    return {
      comment,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profileImageUrl,
  };
};

export const commentsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const comments: Comment[] = await ctx.prisma.comment.findMany({
      take: 20,
      orderBy: {
        timestamp: "desc",
      },
    });
    return addUserDataToComments(comments);
  }),

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

      const comment = await ctx.prisma.comment.create({
        data: {
          authorId,
          content: input.content,
          // CHANGE THIS
          productId: 1,
        },
      });
      return comment;
    }),
});
