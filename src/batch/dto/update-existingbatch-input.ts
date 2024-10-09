import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

@InputType()
export class UpdateExistingBatchInput {
  @Field(() => ID)
  batch_id: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => [ID], { nullable: 'items' })
  @IsOptional()
  @IsArray()
  teacherIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  movePupils?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  maxAbsents?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultMessage?: string;
}
