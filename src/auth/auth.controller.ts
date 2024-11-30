import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './dto/jwt-auth.guard';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  async login(
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    authLoginDto: AuthLoginDto,
  ) {
    const user = await this.authService.validateUser(
      authLoginDto.email,
      authLoginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute() {
    return { message: 'This is a protected route' };
  }
}
