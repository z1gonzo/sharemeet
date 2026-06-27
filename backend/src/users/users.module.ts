import { Module } from '@nestjs/common';
import { JwtAccessModule } from '../auth/jwt-access.module';
import { PostsModule } from '../posts/posts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [JwtAccessModule, PostsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
