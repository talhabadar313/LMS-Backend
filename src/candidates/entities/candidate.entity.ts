import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ChangeHistory } from 'src/changehistory/entities/changehistory.entity';

@ObjectType()
@Entity()
export class Candidate {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  candidate_id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tempPassword?: string;

  @Field()
  @Column({ unique: true })
  phoneNo: string;

  @Field()
  @Column()
  gender: string;

  @Field()
  @Column()
  laptopAvailability: string;

  @Field()
  @Column()
  status: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  age: number;

  @Field()
  @Column()
  qualification: string;

  @Field()
  @Column()
  institutionName: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  allocatedHours: number;

  @Field()
  @Column()
  purpose: string;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @OneToOne(() => User, (user) => user.candidate)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Batch, (batch) => batch.candidates)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch)
  batch?: Batch;

  @OneToMany(() => ChangeHistory, (changeHistory) => changeHistory.candidate, {
    cascade: true,
  })
  @Field(() => [ChangeHistory], { nullable: true })
  changeHistories?: ChangeHistory[];
}
function CreateDateColumn(): (
  target: Candidate,
  propertyKey: 'createdOn',
) => void {
  throw new Error('Function not implemented.');
}
