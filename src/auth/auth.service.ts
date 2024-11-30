import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service'; // Import Users service to validate the user
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.getUser({ email });
      if (user) {
        const isValid = await bcrypt.compare(password, user.password as string);
        if (!isValid) {
          throw new BadRequestException(`Wrong password`);
        }
        return user;
      }
      return null;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(user: User) {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload), // Generate JWT token
    };
  }
}
