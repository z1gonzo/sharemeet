import { Module } from '@nestjs/common';
import { JwtAccessModule } from '../auth/jwt-access.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [JwtAccessModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
