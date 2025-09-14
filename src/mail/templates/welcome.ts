import { TemplateResult } from './types';
import { baseEmail } from './base';

export function welcomeTemplate(params: {
  name?: string;
  startLink?: string;
}): TemplateResult {
  const { name, startLink } = params;
  const subject = '¡Bienvenido/a a Escala Terapia!';
  const cta = startLink
    ? `<p><a class=\"btn\" href=\"${startLink}\">Empezar</a></p>
       <p>Si el botón no funciona, usa este enlace: <a href=\"${startLink}\">${startLink}</a></p>`
    : '';
  const contentHtml = `
    <p>${name ? `Hola ${name},` : 'Hola,'}</p>
    <p>Gracias por unirte a <strong>Escala Terapia</strong>. Estamos felices de acompañarte.</p>
    <p>Desde tu cuenta podrás gestionar clientes, enviar formularios y revisar respuestas.</p>
    ${cta}
    <p>Si necesitas ayuda, responde a este correo y con gusto te apoyamos.</p>
  `;

  return {
    subject,
    html: baseEmail({ title: 'Bienvenido/a', contentHtml }),
    text: `Bienvenido/a a Escala Terapia.${startLink ? ` Comienza aquí: ${startLink}` : ''}`,
  };
}

