import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {ROLES_KEY} from '../roles.decorator';
import {JwtPayload} from '../../auth/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
          statusCode: 403,
          message: `Access denied`,
          error: 'Forbidden',
        });
    }

    return true;
  }
}
