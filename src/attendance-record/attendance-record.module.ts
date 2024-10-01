import { Module } from '@nestjs/common';
import { AttendanceRecordService } from './attendance-record.service';
import { AttendanceRecordResolver } from './attendance-record.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord]),
    AttendanceModule,
    UsersModule,
  ],
  providers: [AttendanceRecordResolver, AttendanceRecordService],
  exports: [TypeOrmModule],
})
export class AttendanceRecordModule {}
