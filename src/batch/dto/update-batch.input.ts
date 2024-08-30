import { CreateBatchInput } from './create-batch.input';
import { InputType, Field, PartialType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateBatchInput extends PartialType(CreateBatchInput) {
  @Field()
  id: string;

  @Field()
  name:string

  @Field(()=>Int)
  maxAbsents: number;

  @Field()
  defaultMessage: string;

  @Field()
  createdOn: string;

  @Field()
  createdBy: string;

  @Field()
  orientationDate: string;

  @Field()
  batchStarted: string;

  @Field()
  classTimings: string; 

  @Field()
  classUpdatedBy: string;

  @Field()
  classUpdatedOn: string;
}
