import { forwardRef, Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { BatchModule } from '../batch/batch.module';
import { TopicsModule } from '../topics/topics.module';
import { AuthModule } from '../auth/auth.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    BatchModule,
    TopicsModule,
    AuthModule,
    MailModule,
    forwardRef(() => SubmissionsModule),
    NotificationsModule
  ],
  providers: [AssignmentsResolver, AssignmentsService ],
  exports: [TypeOrmModule],
})
export class AssignmentsModule {}
