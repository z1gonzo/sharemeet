import {
  BadRequestException,
  ConflictException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
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

const otherUser: UserRecord = {
  ...existingUser,
  id: '16e79b18-96a3-4a14-b4f7-923044cd9f0b',
  email: 'other@example.com',
  username: 'otheruser',
  displayName: 'Other User',
};

const follow = {
  id: '60f5e8fd-4fe4-4d66-a09c-d4838ac3a2ac',
  followerId: existingUser.id,
  followingId: otherUser.id,
  createdAt: new Date('2026-06-29T12:00:00.000Z'),
  follower: existingUser,
  following: otherUser,
};

const publicProfileWithCounts = {
  id: existingUser.id,
  username: existingUser.username,
  displayName: existingUser.displayName,
  bio: 'Building ShareMeet',
  avatarUrl: 'https://example.com/avatar.png',
  isPrivate: true,
  createdAt: existingUser.createdAt,
  _count: { followers: 12, following: 8 },
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
    findPublicProfileByUsername: jest.Mock<
      Promise<typeof publicProfileWithCounts | null>,
      [string]
    >;
    followUser: jest.Mock<Promise<UserRecord>, [string, string]>;
    unfollowUser: jest.Mock<Promise<void>, [string, string]>;
    listFollowers: jest.Mock<
      Promise<Array<typeof follow>>,
      [string, { limit: number; offset: number }]
    >;
    listFollowing: jest.Mock<
      Promise<Array<typeof follow>>,
      [string, { limit: number; offset: number }]
    >;
  };
  let postsService: {
    findByAuthorId: jest.Mock<
      Promise<PostRecord[]>,
      [{ authorId: string; limit: number; offset: number }]
    >;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn<Promise<UserRecord>, [string, UpdateProfileDto]>(),
      findByUsername: jest.fn<Promise<UserRecord | null>, [string]>(),
      findPublicProfileByUsername: jest.fn<
        Promise<typeof publicProfileWithCounts | null>,
        [string]
      >(),
      followUser: jest.fn<Promise<UserRecord>, [string, string]>(),
      unfollowUser: jest.fn<Promise<void>, [string, string]>(),
      listFollowers: jest.fn<
        Promise<Array<typeof follow>>,
        [string, { limit: number; offset: number }]
      >(),
      listFollowing: jest.fn<
        Promise<Array<typeof follow>>,
        [string, { limit: number; offset: number }]
      >(),
    };
    postsService = {
      findByAuthorId: jest.fn<
        Promise<PostRecord[]>,
        [{ authorId: string; limit: number; offset: number }]
      >(),
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
    usersService.findPublicProfileByUsername.mockResolvedValue(
      publicProfileWithCounts,
    );

    const response = await request(app.getHttpServer())
      .get('/users/z1gonzo')
      .expect(200);

    expect(usersService.findPublicProfileByUsername).toHaveBeenCalledWith(
      'z1gonzo',
    );
    expect(response.body).toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      username: 'z1gonzo',
      displayName: 'Łukasz',
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
      followersCount: 12,
      followingCount: 8,
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
    expect(postsService.findByAuthorId).toHaveBeenCalledWith({
      authorId: existingUser.id,
      limit: 20,
      offset: 0,
    });
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

  it('GET /users/:username/posts passes limit and offset to the service', async () => {
    usersService.findByUsername.mockResolvedValue(existingUser);
    postsService.findByAuthorId.mockResolvedValue([existingPost]);

    await request(app.getHttpServer())
      .get('/users/z1gonzo/posts?limit=1&offset=1')
      .expect(200);

    expect(postsService.findByAuthorId).toHaveBeenCalledWith({
      authorId: existingUser.id,
      limit: 1,
      offset: 1,
    });
  });

  it('GET /users/:username/posts rejects invalid pagination query params', async () => {
    await request(app.getHttpServer())
      .get('/users/z1gonzo/posts?limit=51')
      .expect(400);
    await request(app.getHttpServer())
      .get('/users/z1gonzo/posts?offset=-1')
      .expect(400);

    expect(usersService.findByUsername).not.toHaveBeenCalled();
    expect(postsService.findByAuthorId).not.toHaveBeenCalled();
  });

  it('GET /users/:username/posts returns 404 for missing profiles', async () => {
    usersService.findByUsername.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/users/missinguser/posts')
      .expect(404);

    expect(postsService.findByAuthorId).not.toHaveBeenCalled();
  });

  it('GET /users/:username returns 404 for missing profiles', async () => {
    usersService.findPublicProfileByUsername.mockResolvedValue(null);

    await request(app.getHttpServer()).get('/users/missinguser').expect(404);
  });

  it('POST /users/:username/follow follows a user', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: existingUser.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.followUser.mockResolvedValue(otherUser);

    const response = await request(app.getHttpServer())
      .post('/users/otheruser/follow')
      .set('authorization', 'Bearer signed-access-token')
      .expect(201);

    expect(usersService.followUser).toHaveBeenCalledWith(
      existingUser.id,
      'otheruser',
    );
    expect(response.body).toMatchObject({
      id: otherUser.id,
      username: 'otheruser',
      displayName: 'Other User',
    });
    expect(response.body).not.toHaveProperty('email');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('POST /users/:username/follow rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/users/otheruser/follow')
      .expect(401);

    expect(usersService.followUser).not.toHaveBeenCalled();
  });

  it('POST /users/:username/follow returns 400 for self-follow', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: existingUser.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.followUser.mockRejectedValue(
      new BadRequestException('You cannot follow yourself'),
    );

    await request(app.getHttpServer())
      .post('/users/z1gonzo/follow')
      .set('authorization', 'Bearer signed-access-token')
      .expect(400);
  });

  it('POST /users/:username/follow returns 404 for missing profile', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: existingUser.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.followUser.mockRejectedValue(
      new NotFoundException('User profile not found'),
    );

    await request(app.getHttpServer())
      .post('/users/missinguser/follow')
      .set('authorization', 'Bearer signed-access-token')
      .expect(404);
  });

  it('POST /users/:username/follow returns 409 when already following', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: existingUser.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.followUser.mockRejectedValue(
      new ConflictException('Already following user'),
    );

    await request(app.getHttpServer())
      .post('/users/otheruser/follow')
      .set('authorization', 'Bearer signed-access-token')
      .expect(409);
  });

  it('DELETE /users/:username/follow unfollows a user idempotently', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: existingUser.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    usersService.unfollowUser.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete('/users/otheruser/follow')
      .set('authorization', 'Bearer signed-access-token')
      .expect(204)
      .expect('');

    expect(usersService.unfollowUser).toHaveBeenCalledWith(
      existingUser.id,
      'otheruser',
    );
  });

  it('DELETE /users/:username/follow rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .delete('/users/otheruser/follow')
      .expect(401);

    expect(usersService.unfollowUser).not.toHaveBeenCalled();
  });

  it('GET /users/:username/followers returns paginated followers', async () => {
    usersService.listFollowers.mockResolvedValue([follow]);

    const response = await request(app.getHttpServer())
      .get('/users/otheruser/followers?limit=1&offset=0')
      .expect(200);

    expect(usersService.listFollowers).toHaveBeenCalledWith('otheruser', {
      limit: 1,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      {
        id: existingUser.id,
        username: 'z1gonzo',
      },
    ]);
    expect(JSON.stringify(response.body)).not.toContain('email');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('GET /users/:username/following returns paginated followed users', async () => {
    usersService.listFollowing.mockResolvedValue([follow]);

    const response = await request(app.getHttpServer())
      .get('/users/z1gonzo/following?limit=1&offset=0')
      .expect(200);

    expect(usersService.listFollowing).toHaveBeenCalledWith('z1gonzo', {
      limit: 1,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      {
        id: otherUser.id,
        username: 'otheruser',
      },
    ]);
  });

  it('GET /users/:username/followers rejects invalid pagination query params', async () => {
    await request(app.getHttpServer())
      .get('/users/z1gonzo/followers?limit=51')
      .expect(400);
    await request(app.getHttpServer())
      .get('/users/z1gonzo/following?offset=-1')
      .expect(400);

    expect(usersService.listFollowers).not.toHaveBeenCalled();
    expect(usersService.listFollowing).not.toHaveBeenCalled();
  });

  it('GET /users/:username/followers returns 404 for missing profile', async () => {
    usersService.listFollowers.mockRejectedValue(
      new NotFoundException('User profile not found'),
    );

    await request(app.getHttpServer())
      .get('/users/missinguser/followers')
      .expect(404);
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
