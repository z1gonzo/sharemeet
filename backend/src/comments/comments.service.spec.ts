import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostVisibility } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsService, commentInclude } from './comments.service';

const author = {
  id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
  username: 'z1gonzo',
  displayName: 'Łukasz',
  avatarUrl: 'https://example.com/avatar.png',
  isPrivate: false,
};

const comment = {
  id: 'c3afc5cb-4bfb-4f13-8901-3b3d86b57f75',
  postId: '1f2557e7-96d8-46a6-95c7-b6790f595c85',
  authorId: author.id,
  content: 'Great post',
  createdAt: new Date('2026-06-29T16:00:00.000Z'),
  updatedAt: new Date('2026-06-29T16:00:00.000Z'),
  author,
};

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: {
    post: { findFirst: jest.Mock };
    comment: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      post: { findFirst: jest.fn() },
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('creates a comment on a public post', async () => {
    prisma.post.findFirst.mockResolvedValue({ id: comment.postId });
    prisma.comment.create.mockResolvedValue(comment);

    await expect(
      service.createComment(comment.postId, author.id, {
        content: 'Great post',
      }),
    ).resolves.toEqual(comment);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: { id: comment.postId, visibility: PostVisibility.PUBLIC },
      select: { id: true },
    });
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        postId: comment.postId,
        authorId: author.id,
        content: 'Great post',
      },
      include: commentInclude,
    });
  });

  it('rejects creating a comment on a missing or non-public post', async () => {
    prisma.post.findFirst.mockResolvedValue(null);

    await expect(
      service.createComment(comment.postId, author.id, {
        content: 'Great post',
      }),
    ).rejects.toThrow(new NotFoundException('Post not found'));

    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('lists comments oldest first with pagination', async () => {
    prisma.post.findFirst.mockResolvedValue({ id: comment.postId });
    prisma.comment.findMany.mockResolvedValue([comment]);

    await expect(
      service.listComments({ postId: comment.postId, limit: 20, offset: 0 }),
    ).resolves.toEqual([comment]);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: comment.postId },
      include: commentInclude,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 20,
      skip: 0,
    });
  });

  it('updates own comment', async () => {
    const updatedComment = { ...comment, content: 'Edited comment' };
    prisma.comment.findUnique.mockResolvedValue(comment);
    prisma.comment.update.mockResolvedValue(updatedComment);

    await expect(
      service.updateOwnComment(comment.id, author.id, {
        content: 'Edited comment',
      }),
    ).resolves.toEqual(updatedComment);

    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: comment.id },
      data: { content: 'Edited comment' },
      include: commentInclude,
    });
  });

  it('deletes own comment', async () => {
    prisma.comment.findUnique.mockResolvedValue(comment);
    prisma.comment.delete.mockResolvedValue(comment);

    await expect(
      service.deleteOwnComment(comment.id, author.id),
    ).resolves.toEqual(comment);

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: comment.id },
      include: commentInclude,
    });
  });

  it('rejects editing a missing comment', async () => {
    prisma.comment.findUnique.mockResolvedValue(null);

    await expect(
      service.updateOwnComment(comment.id, author.id, { content: 'Nope' }),
    ).rejects.toThrow(new NotFoundException('Comment not found'));

    expect(prisma.comment.update).not.toHaveBeenCalled();
  });

  it('rejects deleting another author comment', async () => {
    prisma.comment.findUnique.mockResolvedValue(comment);

    await expect(
      service.deleteOwnComment(
        comment.id,
        '00000000-0000-0000-0000-000000000000',
      ),
    ).rejects.toThrow(
      new ForbiddenException('You can only modify your own comments'),
    );

    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });
});
