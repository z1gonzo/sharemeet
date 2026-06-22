import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './users.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel<UserDocument>(User.name)
        private userModel: Model<UserDocument>
    ) {}

    async create(createUserDto: any): Promise<any> {
        // Check if user already exists by email
        const existingUser = await this.userModel.findOne({ email: createUserDto.email });
        
        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.userModel.create({
            ...createUserDto,
            password: hashedPassword,
        });
    }

    async findOne(fields: any): Promise<any> {
        // Placeholder for database lookup - implement with actual query
        const user = await this.userModel.findOne(fields).select('+password');
        
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return user;
    }

    async findById(id: number): Promise<any> {
        // Placeholder for database lookup - implement with actual query
        const user = await this.userModel.findById(id).select('+password');
        
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return user;
    }

    async saveRefreshToken(userId: number, tokenHash: string): Promise<void> {
        // Placeholder for saving refresh token to DB - implement with actual query
        const user = await this.userModel.findById(userId);
        
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        user.refreshToken = tokenHash;
        await user.save();
    }

    async verifyRefreshToken(userId: number, tokenHash: string): Promise<boolean> {
        // Placeholder for verifying refresh token against DB - implement with actual query
        const user = await this.userModel.findById(userId).select('refreshToken');
        
        if (!user || !user.refreshToken) {
            return false;
        }
        
        return user.refreshToken === tokenHash;
    }

    async findByEmail(email: string): Promise<any> {
        const user = await this.userModel.findOne({ email }).select('+password');
        
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return user;
    }
}
