import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from './user.dto';

import { JwtAuthGuard } from 'src/auth/dto/jwt-auth.guard';
import { User } from '@prisma/client';
import { User as UserAuth } from 'src/common/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get data of currently logged in user',
    tags: ['auth'],
    description: 'Get user object of currently logged in user',
  })
  getMe(@UserAuth() user: User): Promise<User> {
    return this.userService.getMe(user);
  }

  @Get('top-commenters')
  @ApiOperation({ summary: 'Get users with the most comments' })
  async getUsersWithMostComments() {
    return this.userService.getUsersWithMostComments();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by id' })
  async getOneById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Get()
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Post('')
  @ApiOperation({ summary: 'Create user' })
  createUser(
    @Body(new ValidationPipe()) formData: CreateUserDto,
  ): Promise<User> {
    return this.userService.create(formData);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @UserAuth() user: User,
    @Body(new ValidationPipe()) data: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/change-password')
  @ApiOperation({ summary: 'Change password as User' })
  async changePassword(
    @UserAuth() user: User,
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    data: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.changePassword(user, data);
    return { message: 'Password successfully changed.' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('')
  @ApiOperation({ summary: 'Delete user account' })
  async delete(@UserAuth() user: User) {
    return this.userService.deleteUser(user.id);
  }
}
