import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { AttendanceRecord } from 'src/attendance-record/entities/attendance-record.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { ChangehistoryModule } from 'src/changehistory/changehistory.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Batch,
      User,
      AttendanceRecord,
      Submission,
      Assignment,
    ]),
    ChangehistoryModule,
    AuthModule,
    UsersModule,
  ],
  providers: [BatchResolver, BatchService],
  exports: [TypeOrmModule],
})
export class BatchModule {}
