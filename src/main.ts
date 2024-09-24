import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; // Correct import for Express
// @ts-ignore
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const server = express(); // Create the Express server
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
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
  await app.init(); // Initialize the NestJS app

  // Start the server on localhost if not in production (like Vercel)
  if (process.env.NODE_ENV !== 'production') {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
      console.log(
        'GraphQL Playground available at http://localhost:3000/graphql',
      );
    });
  }

  return server; // Return the server for serverless platforms
}

// Bootstrap the application
const server = bootstrap(); // Assign the server variable and initialize

// Export the server handler for platforms like Vercel
export default server;
