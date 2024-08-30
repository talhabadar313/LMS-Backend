import { InputType, Field , Int} from '@nestjs/graphql';

@InputType()
export class CreateBatchInput {
  @Field()
  name:string

  @Field()
  category: string;

  @Field(()=>Int)
  maxAbsents: number;

  @Field()
  defaultMessage: string;

  @Field()
  createdOn: string;

  @Field()
  createdBy: string;

  @Field({nullable:true})
  orientationDate: string;

  @Field({nullable:true})
  batchStarted: string;

  @Field({nullable:true})
  classTimings: string; 

  @Field({nullable:true})
  classUpdatedBy: string;

  @Field({nullable:true})
  classUpdatedOn: string;
}
