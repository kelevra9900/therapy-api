import { INestApplication } from '@nestjs/common';

export async function startApp(app: INestApplication) {
  try {
    await app.listen(0);
  } catch (error: any) {
    const recoverableCodes = new Set(['EADDRINUSE', 'EADDRNOTAVAIL', 'EACCES', 'EPERM']);
    if (recoverableCodes.has(error?.code)) {
      await app.init();
    } else {
      throw error;
    }
  }
}
