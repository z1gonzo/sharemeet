import { Module } from '@nestjs/common';
import { JwtAccessModule } from '../auth/jwt-access.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [JwtAccessModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
