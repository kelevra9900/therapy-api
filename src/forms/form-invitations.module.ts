import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {FormInvitationsService} from './form-invitations.service';
import {FormInvitationsController} from './forms.controller';
import {jwtConstants} from '../utils/constants';
import {SharedModule} from '../common/shared.module';
import {AuthService} from '@/auth/auth.service';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    }),
  ],
  providers: [FormInvitationsService, AuthService],
  exports: [FormInvitationsService],
  controllers: [FormInvitationsController],
})
export class FormInvitationModel { }
