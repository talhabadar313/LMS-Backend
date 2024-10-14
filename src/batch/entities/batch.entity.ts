import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  ManyToMany,
  JoinTable,
  AfterLoad,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Candidate } from 'src/candidates/entities/candidate.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { ChangeHistory } from 'src/changehistory/entities/changehistory.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

@ObjectType()
@Entity('batch')
export class Batch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  batch_id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: 'open', nullable: true })
  category: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 3, nullable: true })
  maxAbsents: number;

  @Field()
  @Column({
    default:
      'You are on watchlist! Please Be Regular! Your absences exceed the max allowed absences',
    nullable: true,
  })
  defaultMessage: string;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @ManyToOne(() => User, (user) => user.batchCreated)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  orientationDate?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  orientationTime?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  batchStarted?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  classTimings?: string;

  @OneToMany(() => User, (user) => user.batch)
  @Field(() => [User], { nullable: true })
  users: User[];

  @ManyToMany(() => User, (user) => user.teachingBatches)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  teachers?: User[];

  @Field(() => Int, { nullable: true })
  totalCandidates?: number;

  @Field(() => Int, { nullable: true })
  newCandidates?: number;

  @Field(() => Int, { nullable: true })
  interviewedCandidates?: number;

  @Field(() => Int, { nullable: true })
  invitedCandidates?: number;

  @Field(() => Int, { nullable: true })
  registeredCandidates?: number;

  @Field(() => Int, { nullable: true })
  rejectedCandidates?: number;

  @Field(() => Int, { nullable: true })
  maleCandidates?: number;

  @Field(() => Int, { nullable: true })
  femaleCandidates?: number;

  @OneToMany(() => Candidate, (candidate) => candidate.batch)
  @Field(() => [Candidate], { nullable: true })
  candidates?: Candidate[];

  @OneToMany(() => Post, (post) => post.batch)
  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @OneToMany(() => Topic, (topic) => topic.batch)
  @Field(() => Topic, { nullable: true })
  topics?: Topic[];

  @OneToMany(() => Assignment, (assignment) => assignment.batch)
  @Field(() => [Assignment], { nullable: true })
  assignments?: Assignment[];

  @OneToMany(() => Quiz, (quiz) => quiz.batch)
  @Field(() => Quiz)
  quizzes?: Quiz[];

  @OneToMany(() => Attendance, (attendance) => attendance.batch)
  @Field(() => [Attendance])
  attendances?: Attendance[];

  @OneToMany(() => ChangeHistory, (changeHistory) => changeHistory.batch)
  @Field(() => [ChangeHistory])
  classTimingsHistories?: ChangeHistory[];

  @OneToMany(() => Notification, (notification) => notification.batch)
  @Field(() => [Notification])
  notifications?: Notification[];
}
