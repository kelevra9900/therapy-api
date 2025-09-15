// src/mail/mail.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = parseInt(config.get<string>('SMTP_PORT') || '587', 10);
        const secureEnv = config.get<string>('SMTP_SECURE');
        const secure = secureEnv ? secureEnv === 'true' : port === 465;
        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port,
            secure,
            auth: {
              user: config.get<string>('SMTP_USER'),
              pass: config.get<string>('SMTP_PASS'),
            },
            requireTLS: true,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          }
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
