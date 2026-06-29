import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

type PostRecord = Awaited<ReturnType<PostsService['createPost']>>;

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreatePostDto,
  ) {
    const post = await this.postsService.createPost(request.user.sub, body);
    return this.toPublicPost(post);
  }

  @Get()
  async listPosts(@Query() query: ListPostsQueryDto) {
    const posts = await this.postsService.findFeed({
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });

    return posts.map((post) => this.toPublicPost(post));
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsService.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.toPublicPost(post);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdatePostDto,
  ) {
    const post = await this.postsService.updateOwnPost(
      id,
      request.user.sub,
      body,
    );
    return this.toPublicPost(post);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.postsService.deleteOwnPost(id, request.user.sub);
  }

  private toPublicPost(post: PostRecord) {
    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
    };
  }
}
