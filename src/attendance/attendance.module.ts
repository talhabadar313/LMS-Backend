import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { BatchModule } from '../batch/batch.module';
import { UsersModule } from '../users/users.module';
import { AttendanceRecord } from '../attendance-record/entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceRecord]),
    BatchModule,
    UsersModule,
  ],
  providers: [AttendanceResolver, AttendanceService],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
