import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express'); // Use require syntax for express

const server = express(); // Create an express server

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS for specific origins
  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init(); // Initialize the app

  // Start the server on port 3000
  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
}

// Start the application
export default bootstrap();
