import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCandidateInput {

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

  @Field(() => Int , {nullable:true})
  allocatedHours: number;

  @Field()
  purpose: string;

}
