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
import { ObjectType, Field } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { ID } from '@nestjs/graphql';
import { Post } from 'src/posts/entities/post.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Quiz } from 'src/quizs/entities/quiz.entity';

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
}
