import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { Exclude } from 'class-transformer';

enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsDefined()
  @IsEmail()
  public email: string;

  @ApiProperty({
    description: 'First Name of the user',
    example: 'UserName',
  })
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiProperty({
    description: 'Last Name of the user',
    example: 'LastName',
  })
  @IsOptional()
  @IsString()
  public lastName?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'FEMALE/MALE',
  })
  @IsDefined()
  @IsEnum(Gender)
  public gender: Gender;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsDefined()
  @IsString()
  public password: string;
}

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsDefined()
  @IsString()
  newPassword: string;

  @IsDefined()
  @IsString()
  confirmPassword: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsOptional()
  @IsEnum(Gender)
  public gender?: Gender;
}

export class UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';

  @Exclude()
  password: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
