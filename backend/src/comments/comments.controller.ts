import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

type CommentRecord = Awaited<ReturnType<CommentsService['createComment']>>;

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(
      postId,
      request.user.sub,
      body,
    );
    return this.toPublicComment(comment);
  }

  @Get('posts/:postId/comments')
  async listComments(
    @Param('postId') postId: string,
    @Query() query: ListCommentsQueryDto,
  ) {
    const comments = await this.commentsService.listComments({
      postId,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });
    return comments.map((comment) => this.toPublicComment(comment));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  async updateComment(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.updateOwnComment(
      id,
      request.user.sub,
      body,
    );
    return this.toPublicComment(comment);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  @HttpCode(204)
  async deleteComment(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.commentsService.deleteOwnComment(id, request.user.sub);
  }

  private toPublicComment(comment: CommentRecord) {
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
    };
  }
}
