import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
//@ts-ignore
import { GraphQLUpload, FileUpload } from 'graphql-upload';

@InputType()
export class UpdatePostInput {
  @Field(() => ID)
  post_id: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  files?: Promise<FileUpload>[];

  @Field({ nullable: true })
  @IsString()
  fileType: string;

  @Field({ nullable: true })
  @IsString()
  fileSrc: string;

  @Field({ defaultValue: false, nullable: true })
  @IsBoolean()
  deleted: boolean;
}
