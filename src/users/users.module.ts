import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {jwtConstants} from '../utils/constants';
import {SharedModule} from '../common/shared.module';
import {AuthService} from '@/auth/auth.service';
import {MediaModule} from '@/media/media.module';

@Module({
  imports: [
    SharedModule,
    MediaModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    }),
  ],
  providers: [UsersService, AuthService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
