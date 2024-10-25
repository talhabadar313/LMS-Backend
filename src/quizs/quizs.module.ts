import { forwardRef, Module } from '@nestjs/common';
import { QuizsService } from './quizs.service';
import { QuizsResolver } from './quizs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { BatchModule } from '../batch/batch.module';
import { TopicsModule } from '../topics/topics.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz]),
    BatchModule,
    TopicsModule,
    MailModule,
    NotificationsModule,
    forwardRef(() => SubmissionsModule),
  ],
  providers: [QuizsResolver, QuizsService],
  exports: [TypeOrmModule],
})
export class QuizsModule {}
