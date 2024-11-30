import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUpdateTopicDto, QueryTopicsDto } from './topic.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService) {}

  upsertTopic = async (
    user: User,
    id: number | null,
    data: CreateUpdateTopicDto,
  ) => {
    return this.prisma.topic.upsert({
      where: { id: id ?? -1 },
      update: {
        ...data,
      },
      create: {
        ...data,
        postedBy: {
          connect: { id: user.id },
        },
      },
    });
  };

  getTopics = async (query: QueryTopicsDto, userId?: number) => {
    const { pageSize, page } = query;
    try {
      const skip = page && pageSize ? (page - 1) * pageSize : 0;
      const take = pageSize || 20;
      const topics = await this.prisma.$queryRaw<
        {
          id: number;
          title: string;
          description: string;
          likes: number;
          dislikes: number;
          userLikeStatus: 'LIKE' | 'DISLIKE' | null;
          createdAt: Date;
        }[]
      >`
      SELECT 
          t.id, 
          t.title, 
          t.description, 
          t.category,
          t."createdAt", 
          t."updatedAt",
          t."postedById",
          u."firstName",
          u."lastName",
          u."avatarUrl",
          COUNT(CASE WHEN l."likeStatus" = 'LIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS likes,
          COUNT(CASE WHEN l."likeStatus" = 'DISLIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS dislikes,
          MAX(CASE WHEN l."userId" = ${parseInt(query.userId)} THEN l."likeStatus" ELSE NULL END) AS "userLikeStatus"
      FROM "Topic" t
      LEFT JOIN "Like" l ON l."topicId" = t.id AND l."likeType" = 'TOPIC'
      LEFT JOIN "User" u ON u.id = t."postedById"
      WHERE (${userId}::int IS NULL OR t."postedById" = ${userId})
      GROUP BY t.id ,u."firstName", u."lastName", u."avatarUrl"
      ORDER BY t."createdAt" DESC
      LIMIT ${take} OFFSET ${skip};
    `;
      const countQuery = userId
        ? this.prisma.topic.count({ where: { postedById: userId } })
        : this.prisma.topic.count();
      const count = await countQuery;
      return { count, data: topics };
    } catch (e) {
      throw new BadRequestException(e);
    }
  };

  getHotTopics = async () => {
    try {
      const topics = await this.prisma.$queryRaw<
        {
          id: number;
          title: string;
          description: string;
          likes: number;
          dislikes: number;
          createdAt: Date;
        }[]
      >`
      SELECT 
          t.id, 
          t.title, 
          t.description, 
          t."createdAt", 
          t."updatedAt",
          t."postedById",
          u."firstName",
          u."lastName",
          u."avatarUrl",
          COUNT(CASE WHEN l."likeStatus" = 'LIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS likes,
          COUNT(CASE WHEN l."likeStatus" = 'DISLIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS dislikes
      FROM "Topic" t
      LEFT JOIN "Like" l ON l."topicId" = t.id AND l."likeType" = 'TOPIC'
      LEFT JOIN "User" u ON u.id = t."postedById"
      GROUP BY t.id ,u."firstName", u."lastName", u."avatarUrl"
      ORDER BY t."createdAt" DESC
      LIMIT ${10} OFFSET ${0};
    `;
      return topics;
    } catch (e) {
      throw new BadRequestException(e);
    }
  };

  getTopic = async (id: number, userId?: number) => {
    try {
      const topic = await this.prisma.$queryRaw<
        {
          id: number;
          title: string;
          description: string;
          likes: number;
          dislikes: number;
          userLikeStatus: 'LIKE' | 'DISLIKE' | null;
          createdAt: Date;
        }[]
      >`
      SELECT 
          t.id, 
          t.title, 
          t.description, 
          t.category,
          t."createdAt", 
          t."updatedAt",
          t."postedById",
          u."firstName",
          u."lastName",
          u."avatarUrl",
          COUNT(CASE WHEN l."likeStatus" = 'LIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS likes,
          COUNT(CASE WHEN l."likeStatus" = 'DISLIKE' AND l."likeType" = 'TOPIC' THEN 1 END) AS dislikes,
          MAX(CASE WHEN l."userId" = ${userId} THEN l."likeStatus" ELSE NULL END) AS "userLikeStatus"
      FROM "Topic" t
      LEFT JOIN "Like" l ON l."topicId" = t.id AND l."likeType" = 'TOPIC'
      LEFT JOIN "User" u ON u.id = t."postedById"
      WHERE t.id = ${id} 
        AND (${userId}::int IS NULL OR t."postedById" = ${userId})
      GROUP BY t.id ,u."firstName", u."lastName", u."avatarUrl"
      ORDER BY t."createdAt" DESC;
    `;

      return topic;
    } catch (e) {
      throw new BadRequestException(e);
    }
  };

  likeOrDislikeTopic = async (
    userId: number,
    topicId: number,
    likeStatus: 'LIKE' | 'DISLIKE',
  ): Promise<void> => {
    try {
      const existLike = await this.prisma.like.findFirst({
        where: {
          userId,
          topicId,
          likeType: 'TOPIC',
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
          topic: { connect: { id: topicId } },
          likeStatus,
          likeType: 'TOPIC',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while processing your like/dislike.',
        error,
      );
    }
  };

  deleteTopic = async (topicId: number, userId: number): Promise<void> => {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      select: { postedById: true },
    });

    if (!topic || topic.postedById !== userId) {
      throw new ForbiddenException('You are not allowed to delete this topic');
    }

    await this.prisma.topic.delete({
      where: { id: topicId },
    });
  };
}
