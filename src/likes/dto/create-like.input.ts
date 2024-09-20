import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateLikeInput {
  @Field(() => String)
  @IsString()
  postId: string;

  @Field(() => String)
  @IsString()
  userId: string;
}
