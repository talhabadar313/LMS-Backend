import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Entity()
export class ChangeHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  oldStatus?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  newStatus?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  oldTimings?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  newTimings?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  changeDate: Date;

  @ManyToOne(() => User, (user) => user.changedBy, { nullable: true })
  @JoinColumn({ name: 'changedBy' })
  @Field(() => User, { nullable: true })
  changedBy?: User;

  @ManyToOne(() => Candidate, (candidate) => candidate.changeHistories, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => Candidate, { nullable: true })
  candidate?: Candidate;

  @ManyToOne(() => Batch, (batch) => batch.classTimingsHistories, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => Batch, { nullable: true })
  batch?: Batch;
}
