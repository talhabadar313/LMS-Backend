import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Topic } from 'src/topics/entities/topic.entity';
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

  @Field(() => String)
  @Column()
  createdBy: string;

  @Field(() => Date)
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Field(() => String)
  @Column()
  Date: String;

  @Field(() => Int)
  @Column()
  totalmarks: number;

  @ManyToOne(() => Batch, (batch) => batch.quizzes)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch: Batch;

  @ManyToMany(() => Topic, (topic) => topic.quizzes)
  @JoinTable()
  @Field(() => [Topic])
  topics: Topic[];

  @OneToMany(() => Submission, (submission) => submission)
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
