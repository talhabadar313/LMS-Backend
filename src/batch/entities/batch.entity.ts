import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable } from 'typeorm';

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
  @Column({type:"time", nullable: true })
  orientationTime?: string;

  @Field({ nullable: true })
  @Column({type:'date', nullable: true })
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

  @OneToMany(() => User, user => user.batch)
  @Field(() => [User], { nullable: true })
  users: User[];

  @ManyToMany(() => User, user => user.teachingBatches)
  @JoinTable()
  @Field(() => [User], { nullable: true })
  teachers?: User[];
  }
