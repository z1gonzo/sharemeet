import { Controller, Get, Req, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController extends PassportStrategy {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {
        super();
    }

    @Get('google')
    googlePassport(@Req() req, res) {
        this.authorize(req)(req, res); // Call the authorize method from PassportStrategy
    }

    @Get('google/callback')
    async googleCallback(@Req() req) {
        const userInfo = await this.validate(req);
        
        // Find or create user in database
        let user;
        try {
            user = await this.usersService.findByEmail(userInfo.email);
        } catch (error) {
            // User doesn't exist, create a new one
            console.log('Creating new user from Google OAuth:', userInfo.email);
            user = await this.authService.createGoogleUser(userInfo);
        }
        
        // Generate JWT token
        const token = this.authService.login(user);
        
        return { accessToken: token.accessToken };
    }

    @Get('login')
    async login(@Req() req, res, ...args: any[]) {
        this.authorize(req)(req, res); // Pass OAuth tokens through args
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() body: { userId: number; tokenHash: string }) {
        const user = await this.usersService.findById(body.userId);
        
        if (await this.usersService.verifyRefreshToken(user._id, body.tokenHash)) {
            const newToken = await this.authService.refreshToken({
                userId: user.id,
                tokenHash: body.tokenHash
            });
            return { accessToken: newToken.accessToken };
        }
        
        throw new Error('Invalid refresh token');
    }
}
