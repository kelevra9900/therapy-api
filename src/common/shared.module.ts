import {Global,Module} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {MembershipsService} from '@/memberships/memberships.service';
import {PaymentsService} from '@/payments/payments.service';
import {MailService} from '@/mail/mail.service';
import {PasswordResetService} from '@/auth/password-reset.service';

@Global()
@Module({
	providers: [
		PrismaService, 
		MembershipsService, 
		PaymentsService, 
		MailService, 
		PasswordResetService
	],
	exports: [
		PrismaService, 
		MembershipsService,
		PaymentsService, 
		MailService, 
		PasswordResetService
	],
})
export class SharedModule { }