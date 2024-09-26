import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AssignMarsksToAssignmentInput {
  @Field(() => ID, { nullable: true })
  submissionId: string;

  @Field(() => Number)
  score: number;

  @Field(() => ID)
  studentId: string;

  @Field(() => ID, { nullable: true })
  assignmentId: string;

  @Field(() => ID, { nullable: true })
  checkedBy?: string;
}
