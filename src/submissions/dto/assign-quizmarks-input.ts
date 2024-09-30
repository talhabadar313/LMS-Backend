import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AssignMarsksToQuizInput {
  @Field(() => ID, { nullable: true })
  submissionId: string;

  @Field(() => Number)
  score: number;

  @Field(() => ID)
  studentId: string;

  @Field(() => ID, { nullable: true })
  quizId: string;

  @Field(() => ID, { nullable: true })
  checkedBy?: string;

  @Field(() => [SubmittedQuizDataInput])
  SubmittedData?: SubmittedQuizDataInput[];
}

@InputType()
export class SubmittedQuizDataInput {
  @Field(() => ID, { nullable: true })
  key: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}
