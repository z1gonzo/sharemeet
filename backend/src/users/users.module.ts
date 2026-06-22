import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [forwardRef(() => AuthModule)], // For AuthService dependency
    providers: [UsersService],
    exports: [UsersService, UsersController],
})
export class UsersModule {}
