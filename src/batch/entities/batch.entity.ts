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
} from 'typeorm';

import { Candidate } from 'src/candidates/entities/candidate.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Topic } from 'src/topics/entities/topic.entity';

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
  @Column({ default: 'Please Be Regular!', nullable: true })
  defaultMessage: string;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Field()
  @Column()
  createdBy: string;

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  classUpdatedBy?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  classUpdatedOn?: string;

  @OneToMany(() => User, (user) => user.batch)
  @Field(() => [User], { nullable: true })
  users: User[];

  @ManyToMany(() => User, (user) => user.teachingBatches)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  teachers?: User[];

  @Field(() => Int)
  totalCandidates?: number;

  @Field(() => Int)
  newCandidates?: number;

  @Field(() => Int)
  interviewedCandidates?: number;

  @Field(() => Int)
  invitedCandidates?: number;

  @Field(() => Int)
  registeredCandidates?: number;

  @Field(() => Int)
  rejectedCandidates?: number;

  @Field(() => Int)
  maleCandidates?: number;

  @Field(() => Int)
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

  @AfterLoad()
  async calculateFields() {
    if (this.category === 'open') {
      if (this.candidates) {
        this.totalCandidates = this.candidates.length;
        this.maleCandidates = this.candidates.filter(
          (candidate) => candidate.gender === 'male',
        ).length;
        this.femaleCandidates = this.candidates.filter(
          (candidate) => candidate.gender === 'female',
        ).length;
        this.newCandidates = this.candidates.filter(
          (candidate) => candidate.status === 'new',
        ).length;
        this.interviewedCandidates = this.candidates.filter(
          (candidate) => candidate.status === 'interviewed',
        ).length;
        this.invitedCandidates = this.candidates.filter(
          (candidate) => candidate.status === 'invited',
        ).length;
        this.rejectedCandidates = this.candidates.filter(
          (candidate) => candidate.status === 'rejected',
        ).length;
        this.registeredCandidates = this.candidates.filter(
          (candidate) => candidate.status === 'registered',
        ).length;
      }
    } else {
      if (this.users) {
        this.totalCandidates = this.users.length;
        this.maleCandidates = this.candidates.filter(
          (candidate) => candidate.gender === 'male',
        ).length;
        this.femaleCandidates = this.candidates.filter(
          (candidate) => candidate.gender === 'female',
        ).length;
        this.interviewedCandidates = this.users.filter(
          (user) => user.status === 'interviewed',
        ).length;
        this.registeredCandidates = this.users.filter(
          (user) => user.status === 'registered',
        ).length;
      }
    }
  }
}
