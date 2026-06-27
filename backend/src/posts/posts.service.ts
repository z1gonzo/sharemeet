import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

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
}
