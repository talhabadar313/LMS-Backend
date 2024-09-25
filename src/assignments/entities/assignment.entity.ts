import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
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
import { Batch } from 'src/batch/entities/batch.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
@ObjectType()
@Entity()
export class Assignment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  createdBy: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Field()
  @Column()
  dueDate: String;

  @Field()
  @Column({ type: 'int' })
  totalmarks: number;

  @Field()
  @Column()
  description: string;

  @Field(() => Int, { nullable: true })
  totalSubmissions: number;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  attachmentType?: string[];

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  attachmentSrc?: string[];

  @ManyToOne(() => Batch, (batch) => batch.assignments)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch: Batch;

  @ManyToMany(() => Topic, (topic) => topic.assignments)
  @JoinTable()
  @Field(() => [Topic])
  topics: Topic[];

  @OneToMany(() => Submission, (submission) => submission)
  @Field(() => [Submission])
  submissions: Submission[];
}
