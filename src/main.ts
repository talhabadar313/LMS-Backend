import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Create an Express server instance
const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
  app.enableCors({
    origin: ['https://lms-alpha-five.vercel.app', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init(); // This is important for Vercel to handle requests properly
}

// Initialize the NestJS application on serverless function execution
bootstrap();

// Export the express server for Vercel
export const handler = server;
