import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsString, IsUUID } from 'class-validator';
//@ts-ignore
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateAssignmentInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field()
  createdBy: string;

  @Field(() => Date)
  dueDate: Date;

  @Field()
  totalmarks: number;

  @Field()
  @IsString()
  description: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  files?: Promise<FileUpload>[];

  @Field(() => String)
  @IsUUID()
  batchId: string;

  @Field(() => [String])
  @IsArray()
  topicId: string[];
}
