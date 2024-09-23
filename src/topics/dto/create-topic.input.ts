import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateTopicInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUUID()
  batch_id: string;
}
