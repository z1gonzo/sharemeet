import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-auth.guard';

type UserRecord = Awaited<ReturnType<UsersService['createUser']>>;

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface AuthTokenResponse {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(data: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.usersService.findByEmail(data.email);

    if (!user || !(await compare(data.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const publicUser = this.toPublicUser(user);
    return {
      accessToken: await this.signAccessToken(user),
      user: publicUser,
    };
  }

  async getCurrentUser(payload: JwtPayload): Promise<PublicUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.toPublicUser(user);
  }

  private async signAccessToken(user: UserRecord): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
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
