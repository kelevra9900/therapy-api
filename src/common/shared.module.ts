import {Global,Module} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {MembershipsService} from '@/memberships/memberships.service';
import {PaymentsService} from '@/payments/payments.service';


@Global()
@Module({
	providers: [PrismaService, MembershipsService, PaymentsService],
	exports: [PrismaService, MembershipsService, PaymentsService],
})
export class SharedModule { }