import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 280)
  bio?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @Length(1, 500)
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
