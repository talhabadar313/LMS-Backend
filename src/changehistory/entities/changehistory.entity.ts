import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Candidate } from 'src/candidates/entities/candidate.entity';
@ObjectType()
@Entity()
export class ChangeHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  oldStatus: string;

  @Field()
  @Column()
  newStatus: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  changeDate: Date;

  @ManyToOne(() => Candidate, (candidate) => candidate.changeHistories, { onDelete: 'CASCADE' })
  @Field(() => Candidate)
  candidate: Candidate;
}
