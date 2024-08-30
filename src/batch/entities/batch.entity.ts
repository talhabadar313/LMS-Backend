import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';

@ObjectType()
@Entity()
export class Batch {

  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  batch_id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  category: string;

  @Field(()=>Int)
  @Column({ type: 'int' })
  maxAbsents: number;

  @Field()
  @Column()
  defaultMessage: string;

  @Field()
  @Column()
  createdOn: string;

  @Field()
  @Column()
  createdBy: string;

  @Field({nullable:true})
  @Column({  nullable:true})
  orientationDate: string;

  @Field({nullable:true})
  @Column({ nullable:true})
  batchStarted: string;

  @Field({nullable:true})
  @Column({ nullable:true })
  classTimings: string; 

  @Field({nullable:true})
  @Column({nullable:true})
  classUpdatedBy: string;

  @Field({nullable:true})
  @Column({ nullable:true})
  classUpdatedOn: string;

  @OneToMany(() => User, user => user.batch)
  @Field(() => [User]) 
  users: User[];
}
