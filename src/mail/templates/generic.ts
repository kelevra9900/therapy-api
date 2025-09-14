import { TemplateResult } from './types';
import { baseEmail } from './base';

export function genericTemplate(params: {
  title: string;
  bodyHtml: string;
  subject?: string;
}): TemplateResult {
  const subject = params.subject ?? params.title;
  return {
    subject,
    html: baseEmail({ title: params.title, contentHtml: params.bodyHtml }),
  };
}

