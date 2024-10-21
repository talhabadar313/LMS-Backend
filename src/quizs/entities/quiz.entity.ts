import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('quizs')
export class Quiz {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  quiz_id: string;

  @Field(() => String)
  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.quizsCreated)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Field(() => String)
  @Column()
  Date: String;

  @Field(() => Int)
  @Column()
  totalmarks: number;

  @Field(() => Int, { nullable: true })
  totalSubmissions: number;

  @ManyToOne(() => Batch, (batch) => batch.quizzes)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch: Batch;

  @ManyToMany(() => Topic, (topic) => topic.quizzes)
  @JoinTable()
  @Field(() => [Topic])
  topics: Topic[];

  @OneToMany(() => Submission, (submission) => submission.quiz)
  @Field(() => [Submission])
  submissions: Submission[];

  @Field(() => [MarksBreakDown])
  @Column('json', { nullable: true })
  marksBreakDown?: MarksBreakDown[];
}

@ObjectType()
export class MarksBreakDown {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  value: number;
}
