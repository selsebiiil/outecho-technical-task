import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key', // Secret key to verify JWT
    });
  }

  async validate(payload: any) {
    return { id: payload.id, email: payload.email }; // This will be available in the request
  }
}
