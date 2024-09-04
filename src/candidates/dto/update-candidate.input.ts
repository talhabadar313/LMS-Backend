import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
@InputType()
export class UpdateCandidateInput {

  @Field(() => ID)
  candidate_id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phoneNo: string;

  @Field()
  gender: string;

  @Field()
  laptopAvailability: string;

  @Field()
  status: string;

  @Field(() => Int)
  age: number;

  @Field()
  qualification: string;

  @Field()
  institutionName: string;

  @Field(() => Int)
  allocatedHours: number;

  @Field()
  purpose: string;

  @Field(() => ID)
  @IsUUID()
  batchId?: string;

}
