import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from '../users/dto/login-user.input';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { CandidatesService } from '../candidates/candidates.service'; 

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly candidatesService: CandidatesService, 
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.validateUser(email, password);
    if (user) {
      return user;
    }
    return null;
  }

  async login(loginInput: LoginInput): Promise<{ accessToken: string; user: User; needsPasswordReset?: boolean }> {
    const user = await this.validateUser(loginInput.email, loginInput.password);

    if (user) {
      
      const payload: JwtPayload = { 
        id: user.user_id, 
        name: user.name, 
        email: user.email,
        roles: user.role, 
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

      return { accessToken, user,  needsPasswordReset: false };
    } 

   
    const candidate = await this.candidatesService.findCandidateByEmail(loginInput.email);

    if (candidate && candidate.tempPassword === loginInput.password) {
      return { 
        user:null,
        accessToken:"",
        needsPasswordReset: true 
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token', err.message);
    }
  }
}
