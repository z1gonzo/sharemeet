import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from './../src/users/dto/create-user.dto';
import { UsersService } from './../src/users/users.service';

type CreatedUser = Awaited<ReturnType<UsersService['createUser']>>;

const existingUser: CreatedUser = {
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

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: {
    createUser: jest.Mock<Promise<CreatedUser>, [CreateUserDto]>;
    findByEmail: jest.Mock<Promise<CreatedUser | null>, [string]>;
  };
  let jwtService: {
    signAsync: jest.Mock<Promise<string>, [Record<string, string>]>;
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn<Promise<CreatedUser>, [CreateUserDto]>(),
      findByEmail: jest.fn<Promise<CreatedUser | null>, [string]>(),
    };
    jwtService = {
      signAsync: jest.fn<Promise<string>, [Record<string, string>]>(),
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
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register creates a user and does not return passwordHash', async () => {
    usersService.createUser.mockImplementation((data: CreateUserDto) =>
      Promise.resolve({
        ...existingUser,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
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

  it('POST /auth/login returns an access token for valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash: await hash('plain-password', 12),
    });
    jwtService.signAsync.mockResolvedValue('signed-access-token');

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'lukasz@example.com',
        password: 'plain-password',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      accessToken: 'signed-access-token',
      user: {
        id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
        email: 'lukasz@example.com',
        username: 'z1gonzo',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash: await hash('plain-password', 12),
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'lukasz@example.com',
        password: 'wrong-password',
      })
      .expect(401);
  });
});
