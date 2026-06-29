import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.config';
import { AppModule } from './../src/app.module';
import { CreatePostDto } from './../src/posts/dto/create-post.dto';
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
  createdAt: new Date('2026-06-27T00:00:00.000Z'),
  updatedAt: new Date('2026-06-27T00:00:00.000Z'),
  author,
};

const newerPost: PostRecord = {
  id: '50cc42ac-ef8c-4e0b-9fe6-b3562f9262de',
  authorId: author.id,
  content: 'Newest ShareMeet update',
  createdAt: new Date('2026-06-27T00:01:00.000Z'),
  updatedAt: new Date('2026-06-27T00:01:00.000Z'),
  author,
};

describe('PostsController (e2e)', () => {
  let app: INestApplication<App>;
  let postsService: {
    createPost: jest.Mock<Promise<PostRecord>, [string, CreatePostDto]>;
    findById: jest.Mock<Promise<PostRecord | null>, [string]>;
    findFeed: jest.Mock<
      Promise<PostRecord[]>,
      [{ limit: number; offset: number }]
    >;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    postsService = {
      createPost: jest.fn<Promise<PostRecord>, [string, CreatePostDto]>(),
      findById: jest.fn<Promise<PostRecord | null>, [string]>(),
      findFeed: jest.fn<
        Promise<PostRecord[]>,
        [{ limit: number; offset: number }]
      >(),
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
    postsService.findById.mockResolvedValue(existingPost);

    const response = await request(app.getHttpServer())
      .get(`/posts/${existingPost.id}`)
      .expect(200);

    expect(postsService.findById).toHaveBeenCalledWith(existingPost.id);
    expect(response.body).toMatchObject({
      id: existingPost.id,
      content: 'Hello ShareMeet',
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
        author: { id: author.id, username: 'z1gonzo' },
      },
      {
        id: existingPost.id,
        content: 'Hello ShareMeet',
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

  it('GET /posts rejects invalid pagination query params', async () => {
    await request(app.getHttpServer()).get('/posts?limit=51').expect(400);
    await request(app.getHttpServer()).get('/posts?offset=-1').expect(400);

    expect(postsService.findFeed).not.toHaveBeenCalled();
  });

  it('GET /posts/:id returns 404 for a missing post', async () => {
    postsService.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/posts/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
