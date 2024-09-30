import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsString, IsUUID } from 'class-validator';
//@ts-ignore
import { FileUpload, GraphQLUpload } from 'graphql-upload';
@InputType()
export class UpdateAssignmentInput {
  @Field(() => ID)
  @IsUUID()
  assignment_id: string;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => Date)
  dueDate: Date;

  @Field()
  totalmarks: number;

  @Field()
  @IsString()
  description: string;

  @Field(() => [String], { nullable: true })
  @IsString()
  attachmentType?: string[];

  @Field(() => [String], { nullable: true })
  @IsString()
  attachmentSrc?: string[];

  @Field(() => [GraphQLUpload], { nullable: true })
  files?: Promise<FileUpload>[];

  @Field(() => [String])
  @IsArray()
  topicId: string[];
}
