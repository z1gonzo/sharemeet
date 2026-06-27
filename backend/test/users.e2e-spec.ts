import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.config';
import { AppModule } from './../src/app.module';
import { UpdateProfileDto } from './../src/users/dto/update-profile.dto';
import { UsersService } from './../src/users/users.service';

type UserRecord = Awaited<ReturnType<UsersService['updateProfile']>>;

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

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: {
    updateProfile: jest.Mock<Promise<UserRecord>, [string, UpdateProfileDto]>;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn<Promise<UserRecord>, [string, UpdateProfileDto]>(),
    };
    jwtService = {
      verifyAsync: jest.fn<Promise<JwtPayload>, [string]>(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
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
