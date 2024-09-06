import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; 
    }

    const ctx = context.getArgByIndex(2);
    const user = ctx.req.user; 
    if (!user || !requiredRoles.some(role => user.roles?.includes(role))) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
