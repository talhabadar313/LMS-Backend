import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
import * as dotenv from 'dotenv';
// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';

dotenv.config({ path: '.env' });
const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
    ],
    credentials: true,
  });

  server.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  await app.init();
  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
  });
}

bootstrap();
