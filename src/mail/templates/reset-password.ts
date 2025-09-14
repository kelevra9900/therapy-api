import { TemplateResult } from './types';
import { baseEmail } from './base';

export function resetPasswordTemplate(params: {
  resetUrl: string;
  name?: string;
}): TemplateResult {
  const { resetUrl, name } = params;
  const subject = 'Restablecer tu contraseña – Escala Terapia';
  const contentHtml = `
    <p>${name ? `Hola ${name},` : 'Hola,'}</p>
    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
    <p><a class="btn" href="${resetUrl}">Restablecer contraseña</a></p>
    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Si no hiciste esta solicitud, puedes ignorar este mensaje.</p>
  `;

  return {
    subject,
    html: baseEmail({ title: 'Restablecer contraseña', contentHtml }),
    text: `Hemos recibido una solicitud para restablecer tu contraseña. Abre este enlace: ${resetUrl}`,
  };
}

