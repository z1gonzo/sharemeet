import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Assuming this exists or will be created

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string, ...args: any[]): Promise<any> {
        const user = await this.usersService.findOne({ username });
        
        // Check password (or OAuth provider if args provided for future Google auth)
        if (user && user.password === pass) {
            return user;
        }
        
        // Future: handle Google OAuth tokens here in args[0]
        if (args.length > 0) {
            const googleUser = await this.handleGoogleAuth(...args);
            if (googleUser) return googleUser;
        }
        
        return null;
    }

    async login(user: any, ...args: any[]) {
        const payload = { username: user.username, sub: user.id };

        // Access Token (short-lived) - 15 minutes
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

        // Refresh Token (long-lived) - stored in DB for 7 days
        const refreshTokenPayload = {
            userId: user.id,
            tokenHash: Math.random().toString(36).substring(7), // Example hash logic
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        // Save refresh token to database (simplified)
        await this.usersService.saveRefreshToken(user.id, refreshTokenPayload.tokenHash);

        return {
            accessToken,
            refreshToken: JSON.stringify(refreshTokenPayload),
        };
    }

    async refreshToken(tokenPayload: any) {
        const user = await this.usersService.findById(tokenPayload.userId);
        
        // Verify refresh token against DB (simplified logic)
        if (!user || !await this.usersService.verifyRefreshToken(user.id, tokenPayload.tokenHash)) {
            return null; // Invalid token
        }

        // Issue new access token
        const payload = { username: user.username, sub: user.id };
        return { accessToken: this.jwtService.sign(payload) };
    }
}
