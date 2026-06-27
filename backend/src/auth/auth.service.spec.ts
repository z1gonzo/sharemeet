import { Test, TestingModule } from '@nestjs/testing';
import { compare } from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

type CreatedUser = Awaited<ReturnType<UsersService['createUser']>>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    createUser: jest.Mock<Promise<CreatedUser>, [CreateUserDto]>;
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn<Promise<CreatedUser>, [CreateUserDto]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a user with a hashed password and returns a public user', async () => {
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
});
