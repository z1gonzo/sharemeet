import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.config';
import { AppModule } from './../src/app.module';
import { PostsService } from './../src/posts/posts.service';
import { UpdateProfileDto } from './../src/users/dto/update-profile.dto';
import { UsersService } from './../src/users/users.service';

type UserRecord = Awaited<ReturnType<UsersService['updateProfile']>>;
type PostRecord = Awaited<ReturnType<PostsService['createPost']>>;

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

const existingUser: UserRecord = {
  id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
  email: 'lukasz@example.com',
  username: 'z1gonzo',
  passwordHash: 'hashed-password',
  displayName: 'Łukasz',
  bio: null,
  avatarUrl: null,
  isPrivate: false,
  isActive: true,
  createdAt: new Date('2026-06-27T00:00:00.000Z'),
  updatedAt: new Date('2026-06-27T00:00:00.000Z'),
};

const existingPost: PostRecord = {
  id: '1f2557e7-96d8-46a6-95c7-b6790f595c85',
  authorId: existingUser.id,
  content: 'Hello ShareMeet',
  createdAt: new Date('2026-06-27T01:00:00.000Z'),
  updatedAt: new Date('2026-06-27T01:00:00.000Z'),
  author: {
    id: existingUser.id,
    username: existingUser.username,
    displayName: existingUser.displayName,
    avatarUrl: existingUser.avatarUrl,
    isPrivate: existingUser.isPrivate,
  },
};

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: {
    updateProfile: jest.Mock<Promise<UserRecord>, [string, UpdateProfileDto]>;
    findByUsername: jest.Mock<Promise<UserRecord | null>, [string]>;
  };
  let postsService: {
    findByAuthorId: jest.Mock<Promise<PostRecord[]>, [string]>;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn<Promise<UserRecord>, [string, UpdateProfileDto]>(),
      findByUsername: jest.fn<Promise<UserRecord | null>, [string]>(),
    };
    postsService = {
      findByAuthorId: jest.fn<Promise<PostRecord[]>, [string]>(),
    };
    jwtService = {
      verifyAsync: jest.fn<Promise<JwtPayload>, [string]>(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
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

  it('GET /users/:username returns a public profile without private auth fields', async () => {
    usersService.findByUsername.mockResolvedValue({
      ...existingUser,
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
    });

    const response = await request(app.getHttpServer())
      .get('/users/z1gonzo')
      .expect(200);

    expect(usersService.findByUsername).toHaveBeenCalledWith('z1gonzo');
    expect(response.body).toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      username: 'z1gonzo',
      displayName: 'Łukasz',
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
    });
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).not.toHaveProperty('email');
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('isActive');
    expect(response.body).not.toHaveProperty('updatedAt');
  });

  it('GET /users/:username/posts returns public posts for a profile', async () => {
    usersService.findByUsername.mockResolvedValue(existingUser);
    postsService.findByAuthorId.mockResolvedValue([existingPost]);

    const response = await request(app.getHttpServer())
      .get('/users/z1gonzo/posts')
      .expect(200);

    expect(usersService.findByUsername).toHaveBeenCalledWith('z1gonzo');
    expect(postsService.findByAuthorId).toHaveBeenCalledWith(existingUser.id);
    expect(response.body).toHaveLength(1);
    expect(response.body).toMatchObject([
      {
        id: existingPost.id,
        content: 'Hello ShareMeet',
        author: {
          id: existingUser.id,
          username: 'z1gonzo',
        },
      },
    ]);
    expect(JSON.stringify(response.body)).not.toContain('email');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('GET /users/:username/posts returns an empty list for profiles without posts', async () => {
    usersService.findByUsername.mockResolvedValue(existingUser);
    postsService.findByAuthorId.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/users/z1gonzo/posts')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('GET /users/:username/posts returns 404 for missing profiles', async () => {
    usersService.findByUsername.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/users/missinguser/posts')
      .expect(404);

    expect(postsService.findByAuthorId).not.toHaveBeenCalled();
  });

  it('GET /users/:username returns 404 for missing profiles', async () => {
    usersService.findByUsername.mockResolvedValue(null);

    await request(app.getHttpServer()).get('/users/missinguser').expect(404);
  });

  it('PATCH /users/me updates current user profile', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.updateProfile.mockResolvedValue({
      ...existingUser,
      displayName: 'Łukasz G.',
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
    });

    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .set('authorization', 'Bearer signed-access-token')
      .send({
        displayName: 'Łukasz G.',
        bio: 'Building ShareMeet',
        avatarUrl: 'https://example.com/avatar.png',
        isPrivate: true,
      })
      .expect(200);

    expect(usersService.updateProfile).toHaveBeenCalledWith(
      '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      {
        displayName: 'Łukasz G.',
        bio: 'Building ShareMeet',
        avatarUrl: 'https://example.com/avatar.png',
        isPrivate: true,
      },
    );
    expect(response.body).toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
      displayName: 'Łukasz G.',
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('PATCH /users/me rejects requests without a bearer token', async () => {
    await request(app.getHttpServer()).patch('/users/me').send({}).expect(401);
  });

  it('PATCH /users/me rejects invalid profile input', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });

    await request(app.getHttpServer())
      .patch('/users/me')
      .set('authorization', 'Bearer signed-access-token')
      .send({
        displayName: '',
        bio: 'x'.repeat(281),
        avatarUrl: 'not-a-url',
        isPrivate: 'yes',
        unexpectedField: 'rejected',
      })
      .expect(400);

    expect(usersService.updateProfile).not.toHaveBeenCalled();
  });
});
