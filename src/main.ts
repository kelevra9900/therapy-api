import {NestFactory} from '@nestjs/core';
import {ConsoleLogger, ValidationPipe} from '@nestjs/common';
import {SwaggerModule,DocumentBuilder} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import {AppModule} from './app.module';

async function bootstrap() {

const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true }));

  app.use(
    ['/docs','/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        'admin': 'password123',
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Therapist API')
    .setDescription('The Therapist API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app,config);

  SwaggerModule.setup('docs',app,document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
