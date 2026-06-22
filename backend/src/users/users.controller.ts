import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    
    // Verify the refresh token against database
    const isValid = await this.usersService.verifyRefreshToken(1, refreshToken); // TODO: extract userId from token
    
    if (!isValid) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = 
      await this.authService.generateTokens();

    // Save the new refresh token to database
    await this.usersService.saveRefreshToken(1, newRefreshToken); // TODO: extract userId from token

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
