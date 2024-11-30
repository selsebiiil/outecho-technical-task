import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  Query,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { TopicService } from './topic.service';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/dto/jwt-auth.guard';
import { CreateUpdateTopicDto, QueryTopicsDto } from './topic.dto';
import { Topic, User } from '@prisma/client';

import { User as UserAuth } from 'src/common/decorators/user.decorator';

@ApiTags('Topics')
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Get all topics with pagination' })
  async getTopicsWithPagination(@Query() query: QueryTopicsDto): Promise<any> {
    return this.topicService.getTopics(query);
  }

  @Get('/hot')
  @ApiOperation({ summary: 'Get hot topics' })
  async getHotTopics(): Promise<any> {
    return this.topicService.getHotTopics();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/my')
  @ApiOperation({ summary: 'Get my topics with pagination' })
  async getMyTopicsWithPagination(
    @UserAuth() user: User,
    @Query() query: QueryTopicsDto,
  ): Promise<any> {
    return this.topicService.getTopics(query, user.id);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get topic' })
  async getTopic(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
  ): Promise<any> {
    return this.topicService.getTopic(id, parseInt(userId));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id?')
  @ApiOperation({ summary: 'Create or Update topic' })
  async createOrUpdateTopic(
    @UserAuth() user: User,
    @Body(new ValidationPipe()) data: CreateUpdateTopicDto,
    @Param('id', ParseIntPipe) id?: number,
  ): Promise<Topic> {
    return this.topicService.upsertTopic(user, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  async likeTopic(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) topicId: number,
    @Body() { likeStatus }: { likeStatus: 'LIKE' | 'DISLIKE' },
  ) {
    await this.topicService.likeOrDislikeTopic(user.id, topicId, likeStatus);
    return { message: 'Like/dislike processed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  async deleteTopic(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.topicService.deleteTopic(id, user.id);
  }
}
