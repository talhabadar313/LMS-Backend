import { forwardRef, Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsResolver } from './submissions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { UsersModule } from '../users/users.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { QuizsModule } from '../quizs/quizs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    forwardRef(() => AssignmentsModule),
    UsersModule,
    QuizsModule,
  ],
  providers: [SubmissionsResolver, SubmissionsService],
  exports: [TypeOrmModule],
})
export class SubmissionsModule {}
