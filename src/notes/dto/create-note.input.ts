import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, ArrayMinSize } from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field(() => [String], { nullable: true })
  @IsString()
  @ArrayMinSize(1)
  note: string[];

  @Field()
  @IsUUID()
  studentId: string;

  @Field(() => [String], { nullable: true })
  @IsUUID()
  @ArrayMinSize(1)
  createdBy: string[];
}
