import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from '../utils/constants';
import {LocalStrategy} from './local.strategy';
import {JwtStrategy} from './jwt.strategy';
import {SharedModule} from '../common/shared.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
