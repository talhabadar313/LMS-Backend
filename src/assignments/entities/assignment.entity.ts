import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Batch } from 'src/batch/entities/batch.entity';
import { Topic } from 'src/topics/entities/topic.entity';
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
  @Column({ type: 'date' })
  dueDate: Date;

  @Field()
  @Column({ type: 'int' })
  totalmarks: number;

  @Field()
  @Column()
  description: string;

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
}
