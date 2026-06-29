import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/guards/jwt-auth.guard';
import { ListPostsQueryDto } from '../posts/dto/list-posts-query.dto';
import { PostsService } from '../posts/posts.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

type UserRecord = Awaited<ReturnType<UsersService['updateProfile']>>;
type PostRecord = Awaited<ReturnType<PostsService['createPost']>>;

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get(':username/posts')
  async getPublicProfilePosts(
    @Param('username') username: string,
    @Query() query: ListPostsQueryDto,
  ) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const posts = await this.postsService.findByAuthorId({
      authorId: user.id,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });
    return posts.map((post) => this.toPublicPost(post));
  }

  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.toPublicProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(request.user.sub, body);
    return this.toCurrentUser(user);
  }

  private toCurrentUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toPublicProfile(user: UserRecord) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
    };
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
