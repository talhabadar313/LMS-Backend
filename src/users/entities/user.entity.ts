import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn , OneToOne} from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { Batch } from "src/batch/entities/batch.entity";
import { Candidate } from "src/candidates/entities/candidate.entity";

@ObjectType()
@Entity()
export class User {

  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
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

   @Field(() => Boolean , { nullable: true })
   @Column({ type: 'boolean', default: false, nullable:true })
   watchlisted: boolean;

  @ManyToOne(() => Batch, batch => batch.users, { nullable: true })
  @JoinColumn({ name: 'batchId' }) 
  @Field(() => Batch, { nullable: true }) 
  batch?: Batch;

  @OneToOne(() => Candidate, candidate => candidate.user , { nullable: true })
  @JoinColumn({ name: 'candidateId' })  
  @Field(() => Candidate, { nullable: true })
  candidate?: Candidate;
}
