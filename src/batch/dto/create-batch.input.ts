import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

@InputType()
export class CreateBatchInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => Int, { defaultValue: 3 })
  @IsInt()
  @IsOptional()
  maxAbsents: number;

  @Field({ defaultValue: 'Please Be Regular!' })
  @IsString()
  @IsOptional()
  defaultMessage: string;

  @Field()
  createdBy: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orientationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orientationTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  batchStarted?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  classTimings?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  classUpdatedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  classUpdatedOn?: string;

  @Field(() => [String])
  @IsOptional()
  @IsArray()
  teacherIds: string[];
}
