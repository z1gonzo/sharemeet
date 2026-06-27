export class CreateUserDto {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string;
}
