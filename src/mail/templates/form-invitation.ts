import { TemplateResult } from './types';
import { baseEmail } from './base';

export function formInvitationTemplate(params: {
  formTitle: string;
  invitationLink: string;
  clientName?: string;
  expiresAt?: Date | string | null;
}): TemplateResult {
  const { formTitle, invitationLink, clientName, expiresAt } = params;
  const subject = `Invitación a formulario: ${formTitle}`;
  const expText = expiresAt
    ? `<p>Este enlace expira el <strong>${
        typeof expiresAt === 'string' ? expiresAt : expiresAt.toISOString()
      }</strong>.</p>`
    : '';
  const contentHtml = `
    <p>${clientName ? `Hola ${clientName},` : 'Hola,'}</p>
    <p>Has recibido una invitación para completar el formulario: <strong>${formTitle}</strong>.</p>
    <p>Puedes acceder al formulario usando el siguiente botón:</p>
    <p><a class="btn" href="${invitationLink}">Abrir formulario</a></p>
    <p>Si el botón no funciona, utiliza este enlace:</p>
    <p><a href="${invitationLink}">${invitationLink}</a></p>
    ${expText}
  `;

  return {
    subject,
    html: baseEmail({ title: 'Invitación a formulario', contentHtml }),
    text: `Has recibido una invitación para completar el formulario "${formTitle}". Abre: ${invitationLink}`,
  };
}

