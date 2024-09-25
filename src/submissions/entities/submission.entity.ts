import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';
import { User } from 'src/users/entities/user.entity';
import { SubmissionStatus, SubmissionType } from 'src/util/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('submissions')
export class Submission {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  submissionid: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: SubmissionType,
  })
  submissionType: SubmissionType;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.NotAssigned,
  })
  status: SubmissionStatus;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  score: number;

  @Field(() => String)
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submissionDate: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    nullable: true,
  })
  @JoinColumn({ name: 'assignmentId' })
  @Field(() => Assignment)
  assignment: Assignment;

  @ManyToOne(() => Quiz, (quiz) => quiz.submissions, { nullable: true })
  @JoinColumn({ name: 'quizId' })
  @Field(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  student: User;

  @Field(() => [SubmittedData], { nullable: true })
  @Column('json', { nullable: true })
  SubmittedData?: SubmittedData[];

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  checkedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  checkedBy?: string;
}

@ObjectType()
export class SubmittedData {
  @Field(() => String)
  key: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}
