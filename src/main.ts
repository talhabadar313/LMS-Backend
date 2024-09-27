import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express'); // Use require syntax for express
// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';

const server = express(); // Create an express server

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  server.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  await app.init();

  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
}

bootstrap();
