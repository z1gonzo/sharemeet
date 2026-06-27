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

describe('PostsController (e2e)', () => {
  let app: INestApplication<App>;
  let postsService: {
    createPost: jest.Mock<Promise<PostRecord>, [string, CreatePostDto]>;
    findById: jest.Mock<Promise<PostRecord | null>, [string]>;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    postsService = {
      createPost: jest.fn<Promise<PostRecord>, [string, CreatePostDto]>(),
      findById: jest.fn<Promise<PostRecord | null>, [string]>(),
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

  it('GET /posts/:id returns 404 for a missing post', async () => {
    postsService.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/posts/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
