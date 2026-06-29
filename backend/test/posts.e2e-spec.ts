import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PostVisibility } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.config';
import { AppModule } from './../src/app.module';
import { CreatePostDto } from './../src/posts/dto/create-post.dto';
import { UpdatePostDto } from './../src/posts/dto/update-post.dto';
import { PostsService } from './../src/posts/posts.service';

type PostRecord = Awaited<ReturnType<PostsService['createPost']>>;

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

const author = {
  id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
  username: 'z1gonzo',
  displayName: 'Łukasz',
  avatarUrl: 'https://example.com/avatar.png',
  isPrivate: false,
};

const existingPost: PostRecord = {
  id: '1f2557e7-96d8-46a6-95c7-b6790f595c85',
  authorId: author.id,
  content: 'Hello ShareMeet',
  visibility: PostVisibility.PUBLIC,
  createdAt: new Date('2026-06-27T00:00:00.000Z'),
  updatedAt: new Date('2026-06-27T00:00:00.000Z'),
  author,
  _count: { comments: 4 },
};

const newerPost: PostRecord = {
  id: '50cc42ac-ef8c-4e0b-9fe6-b3562f9262de',
  authorId: author.id,
  content: 'Newest ShareMeet update',
  visibility: PostVisibility.PUBLIC,
  createdAt: new Date('2026-06-27T00:01:00.000Z'),
  updatedAt: new Date('2026-06-27T00:01:00.000Z'),
  author,
  _count: { comments: 2 },
};

const updatedPost: PostRecord = {
  ...existingPost,
  content: 'Edited ShareMeet post',
  visibility: PostVisibility.FOLLOWERS,
  updatedAt: new Date('2026-06-27T00:02:00.000Z'),
};

describe('PostsController (e2e)', () => {
  let app: INestApplication<App>;
  let postsService: {
    createPost: jest.Mock<Promise<PostRecord>, [string, CreatePostDto]>;
    findPublicById: jest.Mock<Promise<PostRecord | null>, [string]>;
    findFeed: jest.Mock<
      Promise<PostRecord[]>,
      [{ limit: number; offset: number }]
    >;
    findFollowingFeed: jest.Mock<
      Promise<PostRecord[]>,
      [{ followerId: string; limit: number; offset: number }]
    >;
    findOwnPosts: jest.Mock<
      Promise<PostRecord[]>,
      [{ authorId: string; limit: number; offset: number }]
    >;
    updateOwnPost: jest.Mock<
      Promise<PostRecord>,
      [string, string, UpdatePostDto]
    >;
    deleteOwnPost: jest.Mock<Promise<PostRecord>, [string, string]>;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    postsService = {
      createPost: jest.fn<Promise<PostRecord>, [string, CreatePostDto]>(),
      findPublicById: jest.fn<Promise<PostRecord | null>, [string]>(),
      findFeed: jest.fn<
        Promise<PostRecord[]>,
        [{ limit: number; offset: number }]
      >(),
      findFollowingFeed: jest.fn<
        Promise<PostRecord[]>,
        [{ followerId: string; limit: number; offset: number }]
      >(),
      findOwnPosts: jest.fn<
        Promise<PostRecord[]>,
        [{ authorId: string; limit: number; offset: number }]
      >(),
      updateOwnPost: jest.fn<
        Promise<PostRecord>,
        [string, string, UpdatePostDto]
      >(),
      deleteOwnPost: jest.fn<Promise<PostRecord>, [string, string]>(),
    };
    jwtService = {
      verifyAsync: jest.fn<Promise<JwtPayload>, [string]>(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PostsService)
      .useValue(postsService)
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /posts creates a post for the current user', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.createPost.mockResolvedValue(existingPost);

    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Hello ShareMeet' })
      .expect(201);

    expect(postsService.createPost).toHaveBeenCalledWith(author.id, {
      content: 'Hello ShareMeet',
    });
    expect(response.body).toMatchObject({
      id: existingPost.id,
      content: 'Hello ShareMeet',
      visibility: PostVisibility.PUBLIC,
      commentsCount: 4,
      author: {
        id: author.id,
        username: 'z1gonzo',
        displayName: 'Łukasz',
        avatarUrl: 'https://example.com/avatar.png',
        isPrivate: false,
      },
    });
    expect(response.body).not.toHaveProperty('author.email');
    expect(response.body).not.toHaveProperty('author.passwordHash');
  });

  it('POST /posts accepts explicit visibility', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    const followersPost = {
      ...existingPost,
      visibility: PostVisibility.FOLLOWERS,
    };
    postsService.createPost.mockResolvedValue(followersPost);

    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('authorization', 'Bearer signed-access-token')
      .send({
        content: 'Hello ShareMeet',
        visibility: PostVisibility.FOLLOWERS,
      })
      .expect(201);

    expect(postsService.createPost).toHaveBeenCalledWith(author.id, {
      content: 'Hello ShareMeet',
      visibility: PostVisibility.FOLLOWERS,
    });
    expect(response.body).toMatchObject({
      id: existingPost.id,
      visibility: PostVisibility.FOLLOWERS,
    });
  });

  it('POST /posts rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ content: 'Hello ShareMeet' })
      .expect(401);
  });

  it('POST /posts rejects invalid content', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });

    await request(app.getHttpServer())
      .post('/posts')
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: '', unexpectedField: 'rejected' })
      .expect(400);

    expect(postsService.createPost).not.toHaveBeenCalled();
  });

  it('GET /posts/:id returns a public post', async () => {
    postsService.findPublicById.mockResolvedValue(existingPost);

    const response = await request(app.getHttpServer())
      .get(`/posts/${existingPost.id}`)
      .expect(200);

    expect(postsService.findPublicById).toHaveBeenCalledWith(existingPost.id);
    expect(response.body).toMatchObject({
      id: existingPost.id,
      content: 'Hello ShareMeet',
      visibility: PostVisibility.PUBLIC,
      commentsCount: 4,
      author: {
        id: author.id,
        username: 'z1gonzo',
      },
    });
    expect(response.body).not.toHaveProperty('author.email');
    expect(response.body).not.toHaveProperty('author.passwordHash');
  });

  it('GET /posts returns global feed posts with default pagination', async () => {
    postsService.findFeed.mockResolvedValue([newerPost, existingPost]);

    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);

    expect(postsService.findFeed).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      {
        id: newerPost.id,
        content: 'Newest ShareMeet update',
        commentsCount: 2,
        author: { id: author.id, username: 'z1gonzo' },
      },
      {
        id: existingPost.id,
        content: 'Hello ShareMeet',
        commentsCount: 4,
        author: { id: author.id, username: 'z1gonzo' },
      },
    ]);
    const body = response.body as Array<Record<string, unknown>>;
    expect(body[0]).not.toHaveProperty('author.email');
    expect(body[0]).not.toHaveProperty('author.passwordHash');
  });

  it('GET /posts passes limit and offset to the service', async () => {
    postsService.findFeed.mockResolvedValue([existingPost]);

    await request(app.getHttpServer())
      .get('/posts?limit=1&offset=1')
      .expect(200);

    expect(postsService.findFeed).toHaveBeenCalledWith({
      limit: 1,
      offset: 1,
    });
  });

  it('GET /posts/following returns posts from followed users', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.findFollowingFeed.mockResolvedValue([newerPost, existingPost]);

    const response = await request(app.getHttpServer())
      .get('/posts/following')
      .set('authorization', 'Bearer signed-access-token')
      .expect(200);

    expect(postsService.findFollowingFeed).toHaveBeenCalledWith({
      followerId: author.id,
      limit: 20,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      {
        id: newerPost.id,
        content: 'Newest ShareMeet update',
        commentsCount: 2,
        author: { id: author.id, username: 'z1gonzo' },
      },
      {
        id: existingPost.id,
        content: 'Hello ShareMeet',
        commentsCount: 4,
        author: { id: author.id, username: 'z1gonzo' },
      },
    ]);
    expect(JSON.stringify(response.body)).not.toContain('email');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('GET /posts/following passes limit and offset to the service', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.findFollowingFeed.mockResolvedValue([existingPost]);

    await request(app.getHttpServer())
      .get('/posts/following?limit=1&offset=1')
      .set('authorization', 'Bearer signed-access-token')
      .expect(200);

    expect(postsService.findFollowingFeed).toHaveBeenCalledWith({
      followerId: author.id,
      limit: 1,
      offset: 1,
    });
  });

  it('GET /posts/me returns all current user posts across visibilities', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    const privatePost = {
      ...existingPost,
      id: 'e7b79ee3-720b-48e4-9a12-f3c9e7e90fe1',
      content: 'Private ShareMeet note',
      visibility: PostVisibility.PRIVATE,
    };
    postsService.findOwnPosts.mockResolvedValue([privatePost, existingPost]);

    const response = await request(app.getHttpServer())
      .get('/posts/me')
      .set('authorization', 'Bearer signed-access-token')
      .expect(200);

    expect(postsService.findOwnPosts).toHaveBeenCalledWith({
      authorId: author.id,
      limit: 20,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      {
        id: privatePost.id,
        content: 'Private ShareMeet note',
        visibility: PostVisibility.PRIVATE,
        commentsCount: 4,
        author: { id: author.id, username: 'z1gonzo' },
      },
      {
        id: existingPost.id,
        content: 'Hello ShareMeet',
        visibility: PostVisibility.PUBLIC,
        commentsCount: 4,
        author: { id: author.id, username: 'z1gonzo' },
      },
    ]);
  });

  it('GET /posts/me passes limit and offset to the service', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.findOwnPosts.mockResolvedValue([existingPost]);

    await request(app.getHttpServer())
      .get('/posts/me?limit=1&offset=1')
      .set('authorization', 'Bearer signed-access-token')
      .expect(200);

    expect(postsService.findOwnPosts).toHaveBeenCalledWith({
      authorId: author.id,
      limit: 1,
      offset: 1,
    });
  });

  it('GET /posts/me rejects requests without a bearer token', async () => {
    await request(app.getHttpServer()).get('/posts/me').expect(401);

    expect(postsService.findOwnPosts).not.toHaveBeenCalled();
  });

  it('GET /posts/me rejects invalid pagination query params', async () => {
    await request(app.getHttpServer())
      .get('/posts/me?limit=51')
      .set('authorization', 'Bearer signed-access-token')
      .expect(400);
    await request(app.getHttpServer())
      .get('/posts/me?offset=-1')
      .set('authorization', 'Bearer signed-access-token')
      .expect(400);

    expect(postsService.findOwnPosts).not.toHaveBeenCalled();
  });

  it('GET /posts/following rejects requests without a bearer token', async () => {
    await request(app.getHttpServer()).get('/posts/following').expect(401);

    expect(postsService.findFollowingFeed).not.toHaveBeenCalled();
  });

  it('GET /posts/following rejects invalid pagination query params', async () => {
    await request(app.getHttpServer())
      .get('/posts/following?limit=51')
      .set('authorization', 'Bearer signed-access-token')
      .expect(400);
    await request(app.getHttpServer())
      .get('/posts/following?offset=-1')
      .set('authorization', 'Bearer signed-access-token')
      .expect(400);

    expect(postsService.findFollowingFeed).not.toHaveBeenCalled();
  });

  it('GET /posts rejects invalid pagination query params', async () => {
    await request(app.getHttpServer()).get('/posts?limit=51').expect(400);
    await request(app.getHttpServer()).get('/posts?offset=-1').expect(400);

    expect(postsService.findFeed).not.toHaveBeenCalled();
  });

  it('PATCH /posts/:id updates the current user post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.updateOwnPost.mockResolvedValue(updatedPost);

    const response = await request(app.getHttpServer())
      .patch(`/posts/${existingPost.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({
        content: 'Edited ShareMeet post',
        visibility: PostVisibility.FOLLOWERS,
      })
      .expect(200);

    expect(postsService.updateOwnPost).toHaveBeenCalledWith(
      existingPost.id,
      author.id,
      {
        content: 'Edited ShareMeet post',
        visibility: PostVisibility.FOLLOWERS,
      },
    );
    expect(response.body).toMatchObject({
      id: existingPost.id,
      content: 'Edited ShareMeet post',
      visibility: PostVisibility.FOLLOWERS,
      commentsCount: 4,
      author: { id: author.id, username: 'z1gonzo' },
    });
    expect(response.body).not.toHaveProperty('author.email');
    expect(response.body).not.toHaveProperty('author.passwordHash');
  });

  it('PATCH /posts/:id rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .patch(`/posts/${existingPost.id}`)
      .send({ content: 'Edited ShareMeet post' })
      .expect(401);

    expect(postsService.updateOwnPost).not.toHaveBeenCalled();
  });

  it('PATCH /posts/:id rejects invalid content', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });

    await request(app.getHttpServer())
      .patch(`/posts/${existingPost.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: '', unexpectedField: 'rejected' })
      .expect(400);

    expect(postsService.updateOwnPost).not.toHaveBeenCalled();
  });

  it('PATCH /posts/:id returns 403 when editing another author post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '00000000-0000-0000-0000-000000000000',
      email: 'other@example.com',
      username: 'otheruser',
    });
    postsService.updateOwnPost.mockRejectedValue(
      new ForbiddenException('You can only modify your own posts'),
    );

    await request(app.getHttpServer())
      .patch(`/posts/${existingPost.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Edited ShareMeet post' })
      .expect(403);
  });

  it('PATCH /posts/:id returns 404 for a missing post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.updateOwnPost.mockRejectedValue(
      new NotFoundException('Post not found'),
    );

    await request(app.getHttpServer())
      .patch('/posts/00000000-0000-0000-0000-000000000000')
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Edited ShareMeet post' })
      .expect(404);
  });

  it('DELETE /posts/:id deletes the current user post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.deleteOwnPost.mockResolvedValue(existingPost);

    await request(app.getHttpServer())
      .delete(`/posts/${existingPost.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .expect(204)
      .expect('');

    expect(postsService.deleteOwnPost).toHaveBeenCalledWith(
      existingPost.id,
      author.id,
    );
  });

  it('DELETE /posts/:id rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${existingPost.id}`)
      .expect(401);

    expect(postsService.deleteOwnPost).not.toHaveBeenCalled();
  });

  it('DELETE /posts/:id returns 403 when deleting another author post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '00000000-0000-0000-0000-000000000000',
      email: 'other@example.com',
      username: 'otheruser',
    });
    postsService.deleteOwnPost.mockRejectedValue(
      new ForbiddenException('You can only modify your own posts'),
    );

    await request(app.getHttpServer())
      .delete(`/posts/${existingPost.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .expect(403);
  });

  it('DELETE /posts/:id returns 404 for a missing post', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    postsService.deleteOwnPost.mockRejectedValue(
      new NotFoundException('Post not found'),
    );

    await request(app.getHttpServer())
      .delete('/posts/00000000-0000-0000-0000-000000000000')
      .set('authorization', 'Bearer signed-access-token')
      .expect(404);
  });

  it('GET /posts/:id returns 404 for a missing post', async () => {
    postsService.findPublicById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/posts/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
