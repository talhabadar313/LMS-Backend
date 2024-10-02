import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAttendanceInput {
  @Field()
  @IsString()
  sessionDate: Date;

  @Field({ nullable: true })
  @IsString()
  sessionName: string;

  @Field(() => ID)
  @IsUUID()
  batchId: string;

  @Field(() => ID)
  @IsUUID()
  createdBy: string;
}
