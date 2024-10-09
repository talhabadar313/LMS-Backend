import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsInt, IsUUID } from 'class-validator';

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

  @Field(() => ID)
  @IsUUID()
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

  @Field(() => [String])
  @IsOptional()
  @IsArray()
  teacherIds: string[];
}
