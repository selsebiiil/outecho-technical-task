import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUpdateCommentDto } from './comment.dto';
@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  upsertComment = async (
    user: User,
    id: number | null,
    data: CreateUpdateCommentDto,
  ) => {
    const { topicId, ...commentDto } = data;
    return this.prisma.comment.upsert({
      where: { id: id ?? -1 },
      update: {
        ...data,
      },
      create: {
        ...commentDto,
        topic: {
          connect: { id: topicId },
        },
        author: { connect: { id: user.id } },
      },
    });
  };

  likeOrDislikeComment = async (
    userId: number,
    commentId: number,
    likeStatus: 'LIKE' | 'DISLIKE',
  ): Promise<void> => {
    try {
      const existLike = await this.prisma.like.findFirst({
        where: {
          userId,
          commentId,
          likeType: 'COMMENT',
        },
      });
      await this.prisma.like.upsert({
        where: {
          id: existLike?.id ?? -1,
        },
        update: {
          likeStatus: {
            set: likeStatus,
          },
        },
        create: {
          user: { connect: { id: userId } },
          comment: { connect: { id: commentId } },
          likeStatus,
          likeType: 'COMMENT',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while processing your like/dislike.',
        error,
      );
    }
  };

  getCommentsByTopic = async (topicId: number, userId?: number) => {
    try {
      const comments = await this.prisma.$queryRaw<
        {
          id: number;
          content: string;
          userId: number;
          topicId: number;
          likes: number;
          dislikes: number;
          userLikeStatus: 'LIKE' | 'DISLIKE' | null;
          createdAt: Date;
          updatedAt: Date;
        }[]
      >`
      SELECT 
          c.id, 
          c.content, 
          c."authorId", 
          c."topicId", 
          c."createdAt", 
          c."updatedAt",
          u."firstName",
          u."lastName",
          u."avatarUrl",
          COUNT(CASE WHEN l."likeStatus" = 'LIKE' AND l."likeType" = 'COMMENT' THEN 1 END) AS likes,
          COUNT(CASE WHEN l."likeStatus" = 'DISLIKE' AND l."likeType" = 'COMMENT' THEN 1 END) AS dislikes,
          MAX(CASE WHEN l."userId" = ${userId} THEN l."likeStatus" ELSE NULL END) AS "userLikeStatus"
      FROM "Comment" c
      LEFT JOIN "Like" l ON l."commentId" = c.id AND l."likeType" = 'COMMENT'
      LEFT JOIN "User" u ON u.id = c."authorId"
      WHERE c."topicId" = ${topicId}
      GROUP BY c.id, u."firstName", u."lastName", u."avatarUrl"
      ORDER BY likes DESC;
    `;

      return comments;
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while fetching comments.',
        error,
      );
    }
  };

  deleteComment = async (commentId: number, userId: number): Promise<void> => {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment || comment.authorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  };
}
