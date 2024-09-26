import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

@InputType()
export class UpdateBatchInput {
  @Field(() => ID)
  batch_id: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field()
  @IsOptional()
  createdOn: Date;

  @Field(() => ID)
  @IsOptional()
  createdBy: string;

  @Field(() => Int, { defaultValue: 3 })
  @IsInt()
  maxAbsents: number;

  @Field({ defaultValue: 'Please Be Regular!' })
  @IsString()
  defaultMessage: string;

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

  @Field(() => [ID], { nullable: 'items' })
  @IsOptional()
  @IsArray()
  teacherIds?: string[];
}
