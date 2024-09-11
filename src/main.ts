import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'https://lms-alpha-five.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Configure Apollo Server
  const apolloServer = new ApolloServer({
    // Your Apollo server options here
    playground: process.env.NODE_ENV === 'development', // Only enable in development
    // If needed, specify other Apollo Server options
  });

  apolloServer.applyMiddleware({ app, path: '/graphql' });

  await app.init();

  if (process.env.NODE_ENV !== 'production') {
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
      console.log('GraphQL Playground available at http://localhost:3000/graphql');
    });
  }

  return server;
}

bootstrap();
