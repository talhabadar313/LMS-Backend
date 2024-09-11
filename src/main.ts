import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express'; // Use the 'import' syntax for Express

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

  // Start the server on localhost if not in a Vercel environment
  if (process.env.NODE_ENV !== 'production') {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
      console.log('GraphQL Playground available at http://localhost:3000/graphql');
    });
  }
}

// Call bootstrap to initialize the app
bootstrap();

// Export the server handler for Vercel (Vercel will use this)
export default server;
