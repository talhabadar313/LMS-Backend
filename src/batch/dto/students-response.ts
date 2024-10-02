import { Field, ID, ObjectType } from '@nestjs/graphql';

// Rename the Assignment class
@ObjectType()
export class StudentAssignment {
  @Field()
  title: string;

  @Field({ nullable: true })
  score: number | null;
}

// Update the StudentResponse class to use the renamed class
@ObjectType()
export class StudentResponse {
  @Field(() => ID)
  user_id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  absences: number;

  @Field(() => [StudentAssignment]) // Update reference to the renamed class
  assignments: StudentAssignment[]; // List of assignments with titles and scores
}
