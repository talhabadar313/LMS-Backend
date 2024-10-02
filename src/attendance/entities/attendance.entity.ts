import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import { AttendanceRecord } from 'src/attendance-record/entities/attendance-record.entity';
@Entity('attendance')
@ObjectType()
export class Attendance {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  attendance_id: string;

  @Field()
  @Column({ type: 'timestamptz' })
  sessionDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sessionName: string;

  @ManyToOne(() => Batch, (batch) => batch.attendances)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch: Batch;

  @ManyToOne(() => User, (user) => user.attendanceCreated)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;

  @OneToMany(
    () => AttendanceRecord,
    (attendancerecord) => attendancerecord.attendance,
  )
  @Field(() => [AttendanceRecord])
  attendanceRecords: AttendanceRecord[];
}
