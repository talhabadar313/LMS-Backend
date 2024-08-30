import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from '../users/dto/login-user.input';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(loginInput: LoginInput): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    const payload: JwtPayload = { 
      id: user.user_id, 
      name: user.name, 
      email: user.email,
      roles: user.role, 
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    return { accessToken, user };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token', err.message);
    }
  }
}
