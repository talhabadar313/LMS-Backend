import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express'); // Use require syntax for express

const server = express(); // Create an express server

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS for specific origins
  app.enableCors({
    origin: ['https://lms-alpha-five.vercel.app', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init(); // Initialize the app for serverless deployment
}

// Start the application
bootstrap();

// Export the server to be used by Vercel
export default server; // Export default for Vercel serverless functions
