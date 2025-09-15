import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { resetPasswordTemplate } from './templates/reset-password';
import { formInvitationTemplate } from './templates/form-invitation';
import { genericTemplate } from './templates/generic';
import { welcomeTemplate } from './templates/welcome';
import { subscriptionTemplate } from './templates/subscription';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendResetPasswordEmail(to: string, resetUrl: string, name?: string): Promise<void> {
    const tpl = resetPasswordTemplate({ resetUrl, name });
    await this.mailerService.sendMail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  async sendEmail(args: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
  }): Promise<void> {
    const defaultFrom = this.config.get<string>('SMTP_FROM') || '"hello" <hello@escalaterapia.com>';
    await this.mailerService.sendMail({
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      from: args.from ?? defaultFrom,
      cc: args.cc,
      bcc: args.bcc,
    });
  }

  async sendFormInvitationEmail(params: {
    to: string;
    formTitle: string;
    invitationLink: string;
    clientName?: string;
    expiresAt?: Date | string | null;
  }): Promise<void> {
    const tpl = formInvitationTemplate(params);
    await this.sendEmail({ to: params.to, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  async sendGenericNotification(to: string | string[], params: { title: string; bodyHtml: string; subject?: string }) {
    const tpl = genericTemplate(params);
    await this.sendEmail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  async sendWelcomeEmail(to: string, params: { name?: string; startLink?: string }) {
    const tpl = welcomeTemplate(params);
    await this.sendEmail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  async sendSubscriptionNotification(
    to: string,
    params: {
      status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE';
      membershipName?: string;
      amount?: number;
      currency?: string;
      nextBillingDate?: Date | string | null;
      manageLink?: string;
    },
  ) {
    const tpl = subscriptionTemplate(params);
    await this.sendEmail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }
}
