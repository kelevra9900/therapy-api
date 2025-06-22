import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {jwtConstants} from '../utils/constants';
import {SharedModule} from '../common/shared.module';
import {AuthService} from '@/auth/auth.service';
import {TherapistService} from './therapist.service';
import {TherapistController} from './therapist.controller';

@Module({
  imports: [
	SharedModule,
	JwtModule.register({
	  global: true,
	  secret: jwtConstants.secret,
	  signOptions: {expiresIn: '60s'},
	}),
  ],
  providers: [TherapistService, AuthService],
  exports: [TherapistService],
  controllers: [TherapistController],
})
export class TherapistModule { }
