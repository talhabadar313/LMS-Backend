import { Column, Entity, ManyToOne, PrimaryGeneratedColumn , OneToOne, JoinColumn, ManyToMany} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';
import { ID } from '@nestjs/graphql';

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
  address?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  status?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: 'boolean', default: false, nullable: true })
  watchlisted?: boolean;

  @OneToOne(() => Candidate, candidate => candidate.user, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  @Field(() => Candidate, { nullable: true })
  candidate?: Candidate;
  
  @ManyToOne(() => Batch, batch => batch.users)
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch, { nullable: true })
  batch?: Batch;

  @ManyToMany(() => Batch, batch => batch.teachers)
  @Field(() => [Batch], { nullable: true })
  teachingBatches?: Batch[];

}
