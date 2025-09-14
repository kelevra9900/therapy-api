import { BaseLayoutParams } from './types';

export function baseEmail({ title, contentHtml, footerHtml }: BaseLayoutParams): string {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title ?? 'Escala Terapia'}</title>
      <style>
        body { margin:0; padding:0; background:#f6f8fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', 'Noto Sans', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
        .container { max-width: 640px; margin: 0 auto; padding: 24px; }
        .card { background:#fff; border-radius:12px; padding:24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .brand { font-weight: 700; font-size: 18px; color: #1f2937; }
        .title { font-weight: 600; font-size: 18px; color:#111827; margin: 0 0 12px; }
        .content { color:#374151; line-height:1.6; font-size:14px; }
        .footer { color:#6b7280; font-size:12px; margin-top:16px; text-align:center; }
        .btn { display:inline-block; background:#2563eb; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; }
        a { color:#2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="margin-bottom: 12px;" class="brand">Escala Terapia</div>
        <div class="card">
          ${title ? `<h1 class="title">${title}</h1>` : ''}
          <div class="content">${contentHtml}</div>
        </div>
        <div class="footer">${
          footerHtml ??
          'Este es un mensaje automático. Si no esperabas este correo, puedes ignorarlo.'
        }</div>
      </div>
    </body>
  </html>
  `;
}

