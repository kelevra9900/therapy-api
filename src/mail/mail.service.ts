import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Restablecer tu contraseña – Escala Terapia',
      html: `
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no hiciste esta solicitud, puedes ignorar este mensaje.</p>
        <br />
        <p>– El equipo de Escala Terapia</p>
      `,
    });
  }
}