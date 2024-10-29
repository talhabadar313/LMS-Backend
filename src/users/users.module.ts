import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { AuthModule } from '../auth/auth.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { Candidate } from '../candidates/entities/candidate.entity';
import { MailModule } from '../mail/mail.module';
import { Batch } from 'src/batch/entities/batch.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { AttendanceRecord } from 'src/attendance-record/entities/attendance-record.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
@Module({
  imports: [
    forwardRef(() => AuthModule),

    CandidatesModule,
    MailModule,
    TypeOrmModule.forFeature([
      User,
      Candidate,
      Batch,
      Assignment,
      Quiz,
      Attendance,
      AttendanceRecord,
      Submission,
    ]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
