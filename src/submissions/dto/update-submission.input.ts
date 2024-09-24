import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { SubmissionStatus, SubmissionType } from 'src/util/enum';
import { Column } from 'typeorm';

@InputType()
export class UpdateSubmissionInput {
  @Field(() => ID)
  submissionId: string;

  @Field(() => String)
  submissionType: SubmissionType;

  @Field(() => String)
  status: SubmissionStatus;

  @Field(() => Int)
  score: number;

  @Field(() => String)
  submissionDate: string;

  @Field(() => ID)
  assignmentId: string;

  @Field(() => ID)
  quizId: string;

  @Field(() => ID)
  studentId: string;
}
