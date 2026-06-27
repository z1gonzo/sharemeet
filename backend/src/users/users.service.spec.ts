import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

const user = {
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

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('creates a user with auth and profile fields', async () => {
    prisma.user.create.mockResolvedValue(user);

    await expect(
      service.createUser({
        email: 'lukasz@example.com',
        username: 'z1gonzo',
        passwordHash: 'hashed-password',
        displayName: 'Łukasz',
      }),
    ).resolves.toEqual(user);
  });

  it('finds a user by email', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.findByEmail('lukasz@example.com')).resolves.toEqual(
      user,
    );
  });

  it('finds a user by id', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.findById('8b2777e0-0f29-4c73-8708-9c27f98d34aa'),
    ).resolves.toEqual(user);
  });

  it('updates profile fields', async () => {
    const updatedUser = {
      ...user,
      displayName: 'Łukasz G.',
      bio: 'Building ShareMeet',
      avatarUrl: 'https://example.com/avatar.png',
      isPrivate: true,
    };
    prisma.user.update.mockResolvedValue(updatedUser);

    await expect(
      service.updateProfile('8b2777e0-0f29-4c73-8708-9c27f98d34aa', {
        displayName: 'Łukasz G.',
        bio: 'Building ShareMeet',
        avatarUrl: 'https://example.com/avatar.png',
        isPrivate: true,
      }),
    ).resolves.toEqual(updatedUser);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa' },
      data: {
        displayName: 'Łukasz G.',
        bio: 'Building ShareMeet',
        avatarUrl: 'https://example.com/avatar.png',
        isPrivate: true,
      },
    });
  });

  it('returns a friendly conflict when email is already registered', async () => {
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.createUser({
        email: 'lukasz@example.com',
        username: 'z1gonzo',
        passwordHash: 'hashed-password',
      }),
    ).rejects.toThrow(new ConflictException('Email is already registered'));
  });

  it('returns a friendly conflict when username is already taken', async () => {
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['username'] },
      }),
    );

    await expect(
      service.createUser({
        email: 'lukasz@example.com',
        username: 'z1gonzo',
        passwordHash: 'hashed-password',
      }),
    ).rejects.toThrow(new ConflictException('Username is already taken'));
  });
});
