import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

import {FormTemplatesService} from './form-templates.service';
import {FormTemplatesController} from './/form-templates.controller';
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
	providers: [FormTemplatesService,AuthService],
	exports: [FormTemplatesService],
	controllers: [FormTemplatesController],
})
export class FormTemplatesModule { }
