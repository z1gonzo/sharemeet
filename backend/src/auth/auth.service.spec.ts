import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

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

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    createUser: jest.Mock<Promise<CreatedUser>, [CreateUserDto]>;
    findByEmail: jest.Mock<Promise<CreatedUser | null>, [string]>;
    findById: jest.Mock<Promise<CreatedUser | null>, [string]>;
  };
  let jwtService: {
    signAsync: jest.Mock<Promise<string>, [Record<string, string>]>;
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn<Promise<CreatedUser>, [CreateUserDto]>(),
      findByEmail: jest.fn<Promise<CreatedUser | null>, [string]>(),
      findById: jest.fn<Promise<CreatedUser | null>, [string]>(),
    };
    jwtService = {
      signAsync: jest.fn<Promise<string>, [Record<string, string>]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a user with a hashed password and returns a public user', async () => {
    usersService.createUser.mockImplementation((data: CreateUserDto) =>
      Promise.resolve({
        ...existingUser,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
      }),
    );

    const registeredUser = await service.register({
      email: 'lukasz@example.com',
      username: 'z1gonzo',
      password: 'plain-password',
      displayName: 'Łukasz',
    });

    expect(usersService.createUser).toHaveBeenCalledTimes(1);
    const createUserInput = usersService.createUser.mock.calls[0][0];
    expect(createUserInput).toMatchObject({
      email: 'lukasz@example.com',
      username: 'z1gonzo',
      displayName: 'Łukasz',
    });
    expect(createUserInput.passwordHash).not.toBe('plain-password');
    await expect(
      compare('plain-password', createUserInput.passwordHash),
    ).resolves.toBe(true);
    expect(registeredUser).not.toHaveProperty('passwordHash');
    expect(registeredUser).toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
      displayName: 'Łukasz',
    });
  });

  it('returns an access token for valid login credentials', async () => {
    const passwordHash = await hash('plain-password', 12);
    usersService.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash,
    });
    jwtService.signAsync.mockResolvedValue('signed-access-token');

    await expect(
      service.login({
        email: 'lukasz@example.com',
        password: 'plain-password',
      }),
    ).resolves.toMatchObject({
      accessToken: 'signed-access-token',
      user: {
        id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
        email: 'lukasz@example.com',
        username: 'z1gonzo',
      },
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
  });

  it('rejects invalid login credentials', async () => {
    const passwordHash = await hash('plain-password', 12);
    usersService.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash,
    });

    await expect(
      service.login({
        email: 'lukasz@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid email or password');
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('returns the current public user from a valid JWT payload', async () => {
    usersService.findById.mockResolvedValue(existingUser);

    await expect(
      service.getCurrentUser({
        sub: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
        email: 'lukasz@example.com',
        username: 'z1gonzo',
      }),
    ).resolves.toMatchObject({
      id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
  });

  it('rejects current-user lookup when the JWT subject no longer exists', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      service.getCurrentUser({
        sub: 'missing-user-id',
        email: 'missing@example.com',
        username: 'missing',
      }),
    ).rejects.toThrow('User no longer exists');
  });
});
