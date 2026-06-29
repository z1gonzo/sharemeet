import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService, postInclude } from './posts.service';

const author = {
  id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
  username: 'z1gonzo',
  displayName: 'Łukasz',
  avatarUrl: 'https://example.com/avatar.png',
  isPrivate: false,
};

const post = {
  id: '1f2557e7-96d8-46a6-95c7-b6790f595c85',
  authorId: author.id,
  content: 'Hello ShareMeet',
  createdAt: new Date('2026-06-27T00:00:00.000Z'),
  updatedAt: new Date('2026-06-27T00:00:00.000Z'),
  author,
};

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    post: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      post: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('creates a post for an author', async () => {
    prisma.post.create.mockResolvedValue(post);

    await expect(
      service.createPost(author.id, { content: 'Hello ShareMeet' }),
    ).resolves.toEqual(post);

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        authorId: author.id,
        content: 'Hello ShareMeet',
      },
      include: postInclude,
    });
  });

  it('finds a post by id', async () => {
    prisma.post.findUnique.mockResolvedValue(post);

    await expect(service.findById(post.id)).resolves.toEqual(post);

    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: post.id },
      include: postInclude,
    });
  });

  it('finds global feed posts newest first with pagination', async () => {
    prisma.post.findMany.mockResolvedValue([post]);

    await expect(service.findFeed({ limit: 20, offset: 0 })).resolves.toEqual([
      post,
    ]);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 20,
      skip: 0,
    });
  });

  it('finds posts by author id newest first with pagination', async () => {
    prisma.post.findMany.mockResolvedValue([post]);

    await expect(
      service.findByAuthorId({ authorId: author.id, limit: 20, offset: 0 }),
    ).resolves.toEqual([post]);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { authorId: author.id },
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 20,
      skip: 0,
    });
  });

  it('updates own post', async () => {
    const updatedPost = { ...post, content: 'Edited ShareMeet post' };
    prisma.post.findUnique.mockResolvedValue(post);
    prisma.post.update.mockResolvedValue(updatedPost);

    await expect(
      service.updateOwnPost(post.id, author.id, {
        content: 'Edited ShareMeet post',
      }),
    ).resolves.toEqual(updatedPost);

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: post.id },
      data: { content: 'Edited ShareMeet post' },
      include: postInclude,
    });
  });

  it('deletes own post', async () => {
    prisma.post.findUnique.mockResolvedValue(post);
    prisma.post.delete.mockResolvedValue(post);

    await expect(service.deleteOwnPost(post.id, author.id)).resolves.toEqual(
      post,
    );

    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: post.id },
      include: postInclude,
    });
  });

  it('rejects editing a missing post', async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    await expect(
      service.updateOwnPost(post.id, author.id, { content: 'Nope' }),
    ).rejects.toThrow(new NotFoundException('Post not found'));

    expect(prisma.post.update).not.toHaveBeenCalled();
  });

  it('rejects deleting another author post', async () => {
    prisma.post.findUnique.mockResolvedValue(post);

    await expect(
      service.deleteOwnPost(post.id, '00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(
      new ForbiddenException('You can only modify your own posts'),
    );

    expect(prisma.post.delete).not.toHaveBeenCalled();
  });
});
