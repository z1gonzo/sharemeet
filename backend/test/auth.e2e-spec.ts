import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { compare } from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from './../src/users/dto/create-user.dto';
import { UsersService } from './../src/users/users.service';

type CreatedUser = Awaited<ReturnType<UsersService['createUser']>>;

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: {
    createUser: jest.Mock<Promise<CreatedUser>, [CreateUserDto]>;
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn<Promise<CreatedUser>, [CreateUserDto]>(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register creates a user and does not return passwordHash', async () => {
    usersService.createUser.mockImplementation((data: CreateUserDto) =>
      Promise.resolve({
        id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
        bio: null,
        avatarUrl: null,
        isPrivate: false,
        isActive: true,
        createdAt: new Date('2026-06-27T00:00:00.000Z'),
        updatedAt: new Date('2026-06-27T00:00:00.000Z'),
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'lukasz@example.com',
        username: 'z1gonzo',
        password: 'plain-password',
        displayName: 'Łukasz',
      })
      .expect(201);

    const createUserInput = usersService.createUser.mock.calls[0][0];
    expect(createUserInput.passwordHash).not.toBe('plain-password');
    await expect(
      compare('plain-password', createUserInput.passwordHash),
    ).resolves.toBe(true);
    expect(response.body).toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
      displayName: 'Łukasz',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });
});
