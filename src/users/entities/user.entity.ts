import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { ID } from '@nestjs/graphql';
import { Post } from 'src/posts/entities/post.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { AttendanceRecord } from 'src/attendance-record/entities/attendance-record.entity';
import { Note } from 'src/notes/entities/note.entity';
import { ChangeHistory } from 'src/changehistory/entities/changehistory.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Comment } from 'src/comments/entities/comment.entity';
@ObjectType()
@Entity('user')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  role: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  status?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: 'boolean', default: false, nullable: true })
  watchlisted?: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  warning?: String;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  reason?: String;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: 'boolean', default: false, nullable: true })
  terminated?: boolean;

  @OneToOne(() => Candidate, (candidate) => candidate.user, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  @Field(() => Candidate, { nullable: true })
  candidate?: Candidate;

  @ManyToOne(() => Batch, (batch) => batch.users, { nullable: true })
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch, { nullable: true })
  batch?: Batch;

  @ManyToMany(() => Batch, (batch) => batch.teachers)
  @Field(() => [Batch], { nullable: true })
  teachingBatches?: Batch[];

  @OneToMany(() => Like, (like) => like.user)
  @Field(() => [Like], { nullable: true })
  likes?: Like[];

  @OneToMany(() => Submission, (submission) => submission.student)
  @Field(() => [Submission], { nullable: true })
  submissions?: Submission[];

  @OneToMany(() => Submission, (submission) => submission.checkedBy)
  @Field(() => Submission, { nullable: true })
  checkedBy?: Submission[];

  @OneToMany(() => Assignment, (assignment) => assignment.createdBy)
  @Field(() => [Assignment], { nullable: true })
  assignmentsCreated?: Assignment[];

  @OneToMany(() => Quiz, (quiz) => quiz.createdBy)
  @Field(() => [Quiz], { nullable: true })
  quizsCreated?: Quiz[];

  @OneToMany(() => Post, (post) => post.createdBy)
  @Field(() => [Post], { nullable: true })
  postsCreated?: Post[];

  @OneToMany(() => Batch, (batch) => batch.createdBy)
  @Field(() => [Batch], { nullable: true })
  batchCreated?: Batch[];

  @OneToMany(() => Attendance, (attendance) => attendance.createdBy)
  @Field(() => [Attendance], { nullable: true })
  attendanceCreated?: Attendance[];

  @OneToMany(
    () => AttendanceRecord,
    (attendancerecord) => attendancerecord.student,
  )
  @Field(() => [AttendanceRecord], { nullable: true })
  attendanceRecords?: AttendanceRecord[];

  @OneToMany(
    () => AttendanceRecord,
    (attendancerecord) => attendancerecord.markedBy,
  )
  @Field(() => [AttendanceRecord], { nullable: true })
  markedBy?: AttendanceRecord[];

  @OneToMany(() => Note, (note) => note.user)
  @Field(() => [Note], { nullable: true })
  notes?: Note[];

  @OneToMany(() => Note, (note) => note.createdBy)
  @Field(() => [Note], { nullable: true })
  notesCreated?: Note[];

  @Field(() => Int, { nullable: true })
  absences?: number;

  @OneToMany(() => ChangeHistory, (changeHistory) => changeHistory.changedBy)
  @Field(() => [ChangeHistory], { nullable: true })
  changedBy?: ChangeHistory[];

  @OneToMany(() => Notification, (notification) => notification.student)
  @Field(() => [Notification], { nullable: true })
  notifications?: Notification[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => Int, { nullable: true })
  attendedClasses: number;

  @Field(() => Int, { nullable: true })
  submittedAssignments: number;

  @Field(() => Int, { nullable: true })
  attendedQuizzes: number;

  @Field(() => Int, { nullable: true })
  totalClasses: number;

  @Field(() => Int, { nullable: true })
  totalAssignments: number;

  @Field(() => Int, { nullable: true })
  totalQuizzes: number;

  @Field(() => Int, { nullable: true })
  overallScore: number;
}
