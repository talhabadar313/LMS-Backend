import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateTopicInput {
  @Field(() => ID)
  @IsUUID()
  topic_id: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUUID()
  batchId: string;
}
