import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtAccessModule } from './jwt-access.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtAccessModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
