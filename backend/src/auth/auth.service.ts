import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

type UserRecord = Awaited<ReturnType<UsersService['createUser']>>;

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(data: RegisterDto): Promise<PublicUser> {
    const passwordHash = await hash(data.password, 12);
    const user = await this.usersService.createUser({
      email: data.email,
      username: data.username,
      passwordHash,
      displayName: data.displayName,
    });

    return this.toPublicUser(user);
  }

  private toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
