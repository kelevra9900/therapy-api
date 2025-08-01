import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {jwtConstants} from '../utils/constants';
import {SharedModule} from '../common/shared.module';
import {AuthService} from '@/auth/auth.service';
import {ClientsService} from './clients.service';
import {ClientsController} from './clients.controller';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    }),
  ],
  providers: [ClientsService, AuthService],
  exports: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule { }
