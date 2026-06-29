import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  isPrivate: true,
  createdAt: true,
} as const;

interface ListUsersOptions {
  limit: number;
  offset: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(this.getUniqueConstraintMessage(error));
      }

      throw error;
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findPublicProfileByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        ...publicUserSelect,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
  }

  updateProfile(id: string, data: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async followUser(followerId: string, followingUsername: string) {
    const following = await this.findByUsername(followingUsername);

    if (!following) {
      throw new NotFoundException('User profile not found');
    }

    if (following.id === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    try {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId: following.id,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Already following user');
      }

      throw error;
    }

    return following;
  }

  async unfollowUser(followerId: string, followingUsername: string) {
    const following = await this.findByUsername(followingUsername);

    if (!following) {
      throw new NotFoundException('User profile not found');
    }

    if (following.id === followerId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: following.id,
      },
    });
  }

  async listFollowers(username: string, { limit, offset }: ListUsersOptions) {
    const user = await this.findByUsername(username);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: publicUserSelect } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
    });
  }

  async listFollowing(username: string, { limit, offset }: ListUsersOptions) {
    const user = await this.findByUsername(username);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.prisma.follow.findMany({
      where: { followerId: user.id },
      include: { following: { select: publicUserSelect } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
    });
  }

  private isUniqueConstraintError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private getUniqueConstraintMessage(
    error: Prisma.PrismaClientKnownRequestError,
  ) {
    const target = error.meta?.target;

    if (Array.isArray(target) && target.includes('email')) {
      return 'Email is already registered';
    }

    if (Array.isArray(target) && target.includes('username')) {
      return 'Username is already taken';
    }

    return 'User with these details already exists';
  }
}
