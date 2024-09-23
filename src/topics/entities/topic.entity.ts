import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import {
  Column,
  Entity,
  JoinColumn,
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
}
