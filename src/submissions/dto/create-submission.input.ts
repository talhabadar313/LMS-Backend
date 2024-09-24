import { Field, ID, InputType } from '@nestjs/graphql';
import { SubmissionStatus, SubmissionType } from 'src/util/enum';

@InputType()
export class CreateSubmissionInput {
  @Field(() => String)
  submissionType: SubmissionType;

  // Marking assignmentId and quizId as nullable
  @Field(() => ID, { nullable: true })
  assignmentId?: string; // Optional

  @Field(() => ID, { nullable: true })
  quizId?: string; // Optional

  @Field(() => ID)
  studentId: string;

  @Field(() => [SubmittedDataInput], { nullable: true })
  SubmittedData?: SubmittedDataInput[];
}

@InputType()
export class SubmittedDataInput {
  @Field(() => ID)
  key: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}
