import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
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

  @Field(() => [ID])
  topicId: string[];

  @Field(() => [quizMarksBreakDown])
  marksBreakDown?: quizMarksBreakDown[];
}

@InputType()
export class quizMarksBreakDown {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  value: number;
}
