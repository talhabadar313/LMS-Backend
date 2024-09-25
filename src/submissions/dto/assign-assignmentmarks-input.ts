import { Field, ID, InputType } from '@nestjs/graphql';
import { SubmissionStatus } from 'src/util/enum';

@InputType()
export class AssignMarsksToAssignmentInput {
  @Field(() => ID)
  submissionId: string;

  @Field(() => String)
  status: SubmissionStatus;

  @Field(() => Number)
  score: number;

  @Field(() => ID)
  studentId: string;

  @Field(() => String, { nullable: true })
  checkedBy?: string;
}
