// src/mail/mail.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRoot({
      transport: process.env.MAILER_URL ?? '',
      defaults: {
        from: '"hello" <hello@escalaterapia.com>',
      },
      template: {
        dir: __dirname + '/srs/mail/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
