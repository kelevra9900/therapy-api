import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {SharedModule} from './common/shared.module';
import {SubscriptionsModule} from './subscriptions/subscriptions.module';
import {MembershipsModule} from './memberships/memberships.module';
import {StripeModule} from './stripe/stripe.module';
import { ClientsModule } from './clients/clients.module';
import { FormResponsesModule } from './form-responses/form-responses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule, 
    AuthModule,
    SharedModule,
    SubscriptionsModule,
    StripeModule,
    MembershipsModule,
    ClientsModule,
    FormResponsesModule,
  ],
  controllers: [],
})
export class AppModule {}
