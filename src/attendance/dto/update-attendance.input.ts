import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateAttendanceInput {
  @Field(() => ID)
  @IsUUID()
  attendanceId: string;

  @Field()
  sessionDate: Date;

  @Field({ nullable: true })
  sessionName: string;
}
