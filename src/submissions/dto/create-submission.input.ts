import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { SubmissionType } from 'src/util/enum';

@InputType()
export class CreateSubmissionInput {
  @Field(() => ID, { nullable: true })
  assignmentId?: string;

  @Field(() => ID, { nullable: true })
  quizId?: string;

  @Field(() => ID)
  studentId: string;

  @Field(() => Int, { nullable: true })
  score: number;

  @Field(() => [SubmittedDataInput], { nullable: true })
  SubmittedData?: SubmittedDataInput[];

  @Field(() => Date, { nullable: true })
  checkedAt?: Date;

  @Field(() => ID, { nullable: true })
  checkedBy?: string;
}

@InputType()
export class SubmittedDataInput {
  @Field(() => ID, { nullable: true })
  key: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}
