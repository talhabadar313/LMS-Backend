import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';
import { AttendanceStatus } from 'src/util/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attendance_record')
@ObjectType()
export class AttendanceRecord {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  record_id: string;

  @ManyToOne(() => Attendance, (attendance) => attendance.attendanceRecords)
  @JoinColumn({ name: 'attendanceId' })
  attendance: Attendance;

  @ManyToOne(() => User, (user) => user.attendanceRecords)
  @JoinColumn({ name: 'studentId' })
  @Field(() => User, { nullable: true })
  student: User;

  @Field()
  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @ManyToOne(() => User, (user) => user.markedBy)
  @JoinColumn({ name: 'markedBy' })
  @Field(() => User)
  markedBy: User;

  @Field(() => Date)
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  markedOn: Date;
}
