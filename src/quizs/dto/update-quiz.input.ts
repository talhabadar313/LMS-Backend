import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Column } from 'typeorm';

@InputType()
export class UpdateQuizInput {
  @Field(() => ID)
  quiz_id: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  Date: String;

  @Field(() => Int)
  @Column()
  totalmarks: number;

  @Field(() => ID)
  batchId: string;

  @Field(() => [ID])
  topicId: string[];
}
