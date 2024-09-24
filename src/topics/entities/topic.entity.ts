import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Batch } from 'src/batch/entities/batch.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('topics')
export class Topic {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  topic_id: string;

  @Field()
  @Column()
  name: string;

  @ManyToOne(() => Batch, (batch) => batch.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch: Batch;

  @ManyToMany(() => Assignment, (assignment) => assignment.topics)
  @Field(() => [Assignment])
  assignments: Assignment[];

  @ManyToMany(() => Quiz, (quiz) => quiz.topics)
  @Field(() => Quiz)
  quizzes: Quiz;
}
