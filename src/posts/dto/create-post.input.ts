import { Field, InputType, Int } from '@nestjs/graphql';
//@ts-ignore
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  category: string;

  @Field()
  @IsString()
  createdBy: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  files?: Promise<FileUpload>[];

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  likeCount: number;

  @Field(() => String)
  batch_id: string;

  @Field({ defaultValue: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}
