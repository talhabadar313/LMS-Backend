import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ApplicationsResponse {
  @Field(() => Int)
  mondayApplications: number;

  @Field(() => Int)
  tuesdayApplications: number;

  @Field(() => Int)
  wednesdayApplications: number;

  @Field(() => Int)
  thursdayApplications: number;

  @Field(() => Int)
  fridayApplications: number;

  @Field(() => Int)
  saturdayApplications: number;

  @Field(() => Int)
  sundayApplications: number;
}
