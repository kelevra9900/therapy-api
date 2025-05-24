import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {jwtConstants} from '../utils/constants';
import {SharedModule} from '../common/shared.module';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
