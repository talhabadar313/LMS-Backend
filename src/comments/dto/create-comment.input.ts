import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  @IsString()
  userName: string;

  @Field(() => String)
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  postId?: string;
}
