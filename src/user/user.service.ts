import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create = async (data: CreateUserDto) => {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (userExists) {
        throw new BadRequestException('User with that email already exist');
      }
      data.password = await bcrypt.hash(data.password, 12);
      const avatarUrl = `https://robohash.org/${Math.floor(Math.random() * 1000)}.png?set=set3`;
      return this.prisma.user.create({
        data: {
          ...data,
          avatarUrl,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  };

  update = async (id: number, data: UpdateUserDto) => {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: { id: { not: id }, email: data.email },
      });
      if (userExists) {
        throw new BadRequestException(`User already exists with that email`);
      }
      return this.prisma.user.update({ where: { id }, data });
    } catch (e) {
      throw e;
    }
  };

  changePassword = async (user: User, changePasswordDto: ChangePasswordDto) => {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
    try {
      const me = await this.prisma.user.findUnique({ where: { id: user.id } });
      if (!me) {
        throw new NotFoundException({
          name: 'User',
          id: user.id,
        });
      }

      const verifyResponse = await bcrypt.compare(
        oldPassword,
        me.password as string,
      );

      if (!verifyResponse) {
        throw new UnauthorizedException({
          maskAsSecurity: true,
          message: `Old Passwords don't match`,
        });
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Confirmation password does not match');
      }

      const password = await bcrypt.hash(newPassword, 12);
      return this.prisma.user.update({
        where: { id: user.id },
        data: { password },
      });
    } catch (e) {
      throw e;
    }
  };

  getUsersWithMostComments = async () => {
    return this.prisma.user.findMany({
      take: 5,
      orderBy: {
        comments: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  };

  async getUsers() {
    return this.prisma.user.findMany();
  }

  getMe = async (user: User) => {
    return this.prisma.user.findFirst({ where: { email: user.email } });
  };

  getUser = async (query: Prisma.UserWhereInput) => {
    return this.prisma.user.findFirst({ where: query });
  };

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        email: true,
        gender: true,
        topics: { include: { postedBy: true } },
      },
    });
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Delete all comments by the user
        await prisma.comment.deleteMany({
          where: { authorId: userId },
        });

        // Delete all topics by the user
        await prisma.topic.deleteMany({
          where: { postedById: userId },
        });

        // Finally, delete the user account
        await prisma.user.delete({
          where: { id: userId },
        });
      });
    } catch (e) {
      throw new BadRequestException('Error while deleting user', e);
    }
  }
}
