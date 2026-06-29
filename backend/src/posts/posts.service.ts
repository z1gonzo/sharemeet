import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const postAuthorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  isPrivate: true,
} as const;

export const postInclude = {
  author: {
    select: postAuthorSelect,
  },
} as const;

interface FindFeedOptions {
  limit: number;
  offset: number;
}

interface FindByAuthorOptions extends FindFeedOptions {
  authorId: string;
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  createPost(authorId: string, data: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId,
        content: data.content,
      },
      include: postInclude,
    });
  }

  findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
  }

  findFeed({ limit, offset }: FindFeedOptions) {
    return this.prisma.post.findMany({
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
    });
  }

  findByAuthorId({ authorId, limit, offset }: FindByAuthorOptions) {
    return this.prisma.post.findMany({
      where: { authorId },
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: offset,
    });
  }

  async updateOwnPost(id: string, authorId: string, data: UpdatePostDto) {
    const post = await this.findById(id);

    this.assertCanModifyPost(post, authorId);

    return this.prisma.post.update({
      where: { id },
      data: { content: data.content },
      include: postInclude,
    });
  }

  async deleteOwnPost(id: string, authorId: string) {
    const post = await this.findById(id);

    this.assertCanModifyPost(post, authorId);

    return this.prisma.post.delete({
      where: { id },
      include: postInclude,
    });
  }

  private assertCanModifyPost(
    post: Awaited<ReturnType<PostsService['findById']>>,
    authorId: string,
  ): asserts post is NonNullable<typeof post> {
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }
}
