import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsUUID } from 'class-validator';
import { AttendanceStatus } from 'src/util/enum';

@InputType()
export class UpdateAttendanceRecordInput {
  @Field(() => ID)
  @IsUUID()
  attendanceId: string;

  @Field(() => [ID])
  @IsArray()
  @IsUUID()
  studentIds: string;

  @Field(() => [String])
  @IsArray()
  status: AttendanceStatus[];
}
