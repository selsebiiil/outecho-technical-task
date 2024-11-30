import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateUpdateCommentDto } from './comment.dto';
import { JwtAuthGuard } from 'src/auth/dto/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Comment, User } from '@prisma/client';
import { User as UserAuth } from 'src/common/decorators/user.decorator';
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/all/:topicId')
  async getComments(
    @Param('topicId', ParseIntPipe) topicId: number,
    @Query('userId') userId?: string,
  ) {
    return this.commentService.getCommentsByTopic(topicId, parseInt(userId));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id?')
  @ApiOperation({ summary: 'Create or Update comment' })
  async createComment(
    @UserAuth() user: User,
    @Body() data: CreateUpdateCommentDto,
    @Param('id', ParseIntPipe) id?: number,
  ): Promise<Comment> {
    return this.commentService.upsertComment(user, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  async likeTopic(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() { likeStatus }: { likeStatus: 'LIKE' | 'DISLIKE' },
  ) {
    await this.commentService.likeOrDislikeComment(user.id, id, likeStatus);
    return { message: 'Like/dislike processed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteComment(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentService.deleteComment(id, user.id);
  }
}
