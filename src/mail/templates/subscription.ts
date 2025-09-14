import { TemplateResult } from './types';
import { baseEmail } from './base';

type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE';

export function subscriptionTemplate(params: {
  status: SubscriptionStatus;
  membershipName?: string;
  amount?: number;
  currency?: string; // e.g., USD, MXN
  nextBillingDate?: Date | string | null;
  manageLink?: string;
}): TemplateResult {
  const { status, membershipName, amount, currency = 'USD', nextBillingDate, manageLink } = params;

  const titleMap: Record<SubscriptionStatus, string> = {
    ACTIVE: 'Suscripción activada',
    INACTIVE: 'Suscripción inactiva',
    CANCELLED: 'Suscripción cancelada',
    PAST_DUE: 'Pago pendiente de suscripción',
  };

  const subject = `Escala Terapia – ${titleMap[status]}`;
  const amountText = amount != null ? `${amount.toFixed(2)} ${currency}` : undefined;
  const nextText = nextBillingDate
    ? typeof nextBillingDate === 'string'
      ? nextBillingDate
      : nextBillingDate.toISOString()
    : null;

  const details: string[] = [];
  if (membershipName) details.push(`<li><strong>Plan:</strong> ${membershipName}</li>`);
  if (amountText) details.push(`<li><strong>Monto:</strong> ${amountText}</li>`);
  if (nextText) details.push(`<li><strong>Próximo cobro:</strong> ${nextText}</li>`);

  const manageBlock = manageLink
    ? `<p><a class=\"btn\" href=\"${manageLink}\">Gestionar suscripción</a></p>
       <p>Si el botón no funciona, usa este enlace: <a href=\"${manageLink}\">${manageLink}</a></p>`
    : '';

  const contentHtml = `
    <p>${titleMap[status]}</p>
    ${details.length ? `<ul>${details.join('')}</ul>` : ''}
    ${manageBlock}
    <p>Gracias por ser parte de Escala Terapia.</p>
  `;

  return {
    subject,
    html: baseEmail({ title: titleMap[status], contentHtml }),
    text: `${titleMap[status]}${amountText ? ` | Monto: ${amountText}` : ''}${nextText ? ` | Próximo cobro: ${nextText}` : ''}${manageLink ? ` | Gestionar: ${manageLink}` : ''}`,
  };
}

