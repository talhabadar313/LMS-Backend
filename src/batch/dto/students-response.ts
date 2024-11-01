import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StudentAssignment {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  totalmarks: number;

  @Field({ nullable: true })
  dueDate: Date;

  @Field({ nullable: true })
  score: number | null;
}

@ObjectType()
export class StudentResponse {
  @Field(() => ID, { nullable: true })
  candidate_id: string;

  @Field(() => ID, { nullable: true })
  student_id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phoneNo: string;

  @Field({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  age: number;

  @Field({ nullable: true })
  laptopAvailability: string;

  @Field({ nullable: true })
  qualification: string;

  @Field({ nullable: true })
  institutionName: string;

  @Field({ nullable: true })
  allotedHours: number;

  @Field({ nullable: true })
  purpose: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  warning: String;

  @Field({ nullable: true })
  reason: String;

  @Field({ nullable: true })
  batchId: string;

  @Field({ nullable: true })
  batchName: string;

  @Field({ nullable: true })
  watchlisted: boolean;

  @Field({ nullable: true })
  terminated: boolean;

  @Field({ nullable: true })
  absences: number;

  @Field(() => [StudentAssignment], { nullable: true })
  assignments: StudentAssignment[];
}
