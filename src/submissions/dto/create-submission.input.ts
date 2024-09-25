import { Field, ID, InputType } from '@nestjs/graphql';
import { SubmissionStatus, SubmissionType } from 'src/util/enum';

@InputType()
export class CreateSubmissionInput {
  @Field(() => String)
  submissionType: SubmissionType;

  @Field(() => ID, { nullable: true })
  assignmentId?: string;

  @Field(() => ID, { nullable: true })
  quizId?: string;

  @Field(() => ID)
  studentId: string;

  @Field(() => [SubmittedDataInput], { nullable: true })
  SubmittedData?: SubmittedDataInput[];

  @Field(() => Date, { nullable: true })
  checkedAt?: Date;

  @Field(() => String, { nullable: true })
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
