import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class AddNoteInput {
  @Field(() => String, { nullable: true })
  @IsString()
  note: string;

  @Field()
  @IsUUID()
  studentId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  createdBy: string;
}
