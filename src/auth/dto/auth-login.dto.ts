import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export class AuthLoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com', // Example email
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongPassword123', // Example password
  })
  @IsString()
  password: string;
}
