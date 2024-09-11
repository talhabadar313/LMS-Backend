import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { CandidatesModule } from './candidates/candidates.module';
import { MailModule } from './mail/mail.module';


dotenv.config({path:'.env'});

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: process.env.NODE_ENV === 'production' ? true : join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),

    AuthModule,
    UsersModule,
    BatchModule,
    CandidatesModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
