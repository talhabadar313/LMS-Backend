import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { CandidatesModule } from './candidates/candidates.module';
import { MailModule } from './mail/mail.module';
import { ChangehistoryModule } from './changehistory/changehistory.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { TopicsModule } from './topics/topics.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { QuizsModule } from './quizs/quizs.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AttendanceRecordModule } from './attendance-record/attendance-record.module';
import { NotesModule } from './notes/notes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { CommentsModule } from './comments/comments.module';

dotenv.config({ path: '.env' });

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
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
      logging: ['query', 'error'],
      extra: {
        connectionTimeoutMillis: 60000,
        statement_timeout: 30000,
      },
    }),

    AuthModule,
    UsersModule,
    BatchModule,
    CandidatesModule,
    MailModule,
    ChangehistoryModule,
    PostsModule,
    LikesModule,
    TopicsModule,
    AssignmentsModule,
    QuizsModule,
    SubmissionsModule,
    AttendanceModule,
    AttendanceRecordModule,
    NotesModule,
    NotificationsModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [NotificationsGateway],
})
export class AppModule {}
