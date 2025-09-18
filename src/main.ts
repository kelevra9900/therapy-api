import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule,DocumentBuilder} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as bodyParser from 'body-parser';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';

import {AppModule} from './app.module';
import {corsOptions} from './utils/constants';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({whitelist: true,transform: true}));
  app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
  app.enableCors({
    origin: corsOptions.origin,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false,
    maxAge: '1d',
  });

  app.use(
    ['/docs','/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        'admin': 'password123',
      },
    }),
  );

  app.enableCors({
    origin: corsOptions.origin,
  });

  const config = new DocumentBuilder()
    .setTitle('Therapist API')
    .setDescription('The Therapist API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app,config);
  if (process.env.NODE_ENV !== 'production') {
    require('tsconfig-paths/register');
  }
  SwaggerModule.setup('docs',app,document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
