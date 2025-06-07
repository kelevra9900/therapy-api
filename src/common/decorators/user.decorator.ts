import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import {JwtPayload} from '@/auth/types';

export const User = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
