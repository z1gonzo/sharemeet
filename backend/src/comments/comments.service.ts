import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const commentAuthorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  isPrivate: true,
} as const;

export const commentInclude = {
  author: {
    select: commentAuthorSelect,
  },
} as const;

interface ListCommentsOptions {
  postId: string;
  limit: number;
  offset: number;
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    postId: string,
    authorId: string,
    data: CreateCommentDto,
  ) {
    await this.assertPublicPostExists(postId);

    return this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: data.content,
      },
      include: commentInclude,
    });
  }

  async listComments({ postId, limit, offset }: ListCommentsOptions) {
    await this.assertPublicPostExists(postId);

    return this.prisma.comment.findMany({
      where: { postId },
      include: commentInclude,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async updateOwnComment(id: string, authorId: string, data: UpdateCommentDto) {
    const comment = await this.findById(id);

    this.assertCanModifyComment(comment, authorId);

    return this.prisma.comment.update({
      where: { id },
      data: { content: data.content },
      include: commentInclude,
    });
  }

  async deleteOwnComment(id: string, authorId: string) {
    const comment = await this.findById(id);

    this.assertCanModifyComment(comment, authorId);

    return this.prisma.comment.delete({
      where: { id },
      include: commentInclude,
    });
  }

  private findById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: commentInclude,
    });
  }

  private async assertPublicPostExists(postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, visibility: PostVisibility.PUBLIC },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private assertCanModifyComment(
    comment: Awaited<ReturnType<CommentsService['findById']>>,
    authorId: string,
  ): asserts comment is NonNullable<typeof comment> {
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only modify your own comments');
    }
  }
}
