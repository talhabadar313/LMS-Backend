import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; 

async function bootstrap() {
  const server = express(); 
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init();

  if (process.env.NODE_ENV !== 'production') {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
      console.log('GraphQL Playground available at http://localhost:3000/graphql');
    });
  }

  return server;
}

const server = bootstrap(); 

export default server;

