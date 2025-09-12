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
import {MailModule} from '@/mail/mail.module';
import { PasswordResetModule } from './password-reset.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    SharedModule,
    PasswordResetModule,
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

