import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; // Correct import for Express

async function bootstrap() {
  const server = express(); // Create the Express server
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init(); // Initialize the NestJS app

  // Start the server on localhost if not in production (like Vercel)
  if (process.env.NODE_ENV !== 'production') {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
      console.log('GraphQL Playground available at http://localhost:3000/graphql');
    });
  }
}

// Bootstrap the application
bootstrap();

// Export the server handler for platforms like Vercel
export default server;
