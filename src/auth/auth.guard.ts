import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.getArgByIndex(2); 
    const authHeader = ctx.req.headers.authorization; 

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = this.authService.verifyToken(token);
      ctx.req.user = decoded; // Attach the decoded token (including roles) to the request
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token', err.message);
    }
  }
}
