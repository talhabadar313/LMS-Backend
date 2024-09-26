import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Column } from 'typeorm';

@InputType()
export class CreateQuizInput {
  @Field(() => String)
  @Column()
  title: string;

  @Field(() => ID)
  @Column()
  createdBy: string;

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

  @Field(() => [MarksBreakDownInput])
  marksBreakDown?: MarksBreakDownInput[];
}

@InputType()
export class MarksBreakDownInput {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  value: number;
}
