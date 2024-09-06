import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsOptional } from 'class-validator';
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
  @IsOptional()
  status: string;

  @Field()
  @IsUUID()
  @IsOptional()
  batchName?: string;

}
