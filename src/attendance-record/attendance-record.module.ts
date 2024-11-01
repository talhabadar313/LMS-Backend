import { Module } from '@nestjs/common';
import { AttendanceRecordService } from './attendance-record.service';
import { AttendanceRecordResolver } from './attendance-record.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { UsersModule } from '../users/users.module';
import { Batch } from '../batch/entities/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, Batch]),
    AttendanceModule,
    UsersModule,
  ],
  providers: [AttendanceRecordResolver, AttendanceRecordService],
  exports: [TypeOrmModule],
})
export class AttendanceRecordModule {}
