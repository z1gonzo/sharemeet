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
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type {
  AuthenticatedRequest,
  JwtPayload,
} from '../common/guards/jwt-auth.guard';
import { ListPostsQueryDto } from '../posts/dto/list-posts-query.dto';
import { PostsService } from '../posts/posts.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

type UserRecord = Awaited<ReturnType<UsersService['updateProfile']>>;
type PostRecord = Awaited<ReturnType<PostsService['createPost']>>;
type PublicUserRecord = Pick<
  UserRecord,
  | 'id'
  | 'username'
  | 'displayName'
  | 'bio'
  | 'avatarUrl'
  | 'isPrivate'
  | 'createdAt'
>;
type PublicProfileRecord = PublicUserRecord & {
  _count?: {
    followers: number;
    following: number;
  };
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  async followUser(
    @Param('username') username: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const following = await this.usersService.followUser(
      request.user.sub,
      username,
    );

    return this.toPublicProfile(following);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  @HttpCode(204)
  async unfollowUser(
    @Param('username') username: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.usersService.unfollowUser(request.user.sub, username);
  }

  @Get(':username/followers')
  async getFollowers(
    @Param('username') username: string,
    @Query() query: ListUsersQueryDto,
  ) {
    const follows = await this.usersService.listFollowers(username, {
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });

    return follows.map((follow) => this.toPublicProfile(follow.follower));
  }

  @Get(':username/following')
  async getFollowing(
    @Param('username') username: string,
    @Query() query: ListUsersQueryDto,
  ) {
    const follows = await this.usersService.listFollowing(username, {
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });

    return follows.map((follow) => this.toPublicProfile(follow.following));
  }

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
  async getPublicProfile(
    @Param('username') username: string,
    @Req() request: Request,
  ) {
    const user = await this.usersService.findPublicProfileByUsername(username);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const viewerId = await this.getOptionalViewerId(request);
    const isFollowing = viewerId
      ? await this.usersService.isFollowing(viewerId, user.id)
      : false;

    return this.toPublicProfile(user, { isFollowing });
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

  private toPublicProfile(
    user: PublicProfileRecord,
    options?: { isFollowing?: boolean },
  ) {
    const profile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
    };

    if (!user._count) {
      return profile;
    }

    return {
      ...profile,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      ...(options?.isFollowing === undefined
        ? {}
        : { isFollowing: options.isFollowing }),
    };
  }

  private async getOptionalViewerId(request: Request) {
    const token = this.extractBearerToken(request);

    if (!token) {
      return undefined;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private extractBearerToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private toPublicPost(post: PostRecord) {
    return {
      id: post.id,
      content: post.content,
      visibility: post.visibility,
      commentsCount: post._count.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
    };
  }
}
