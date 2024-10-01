import { CreateAttendanceRecordInput } from './create-attendance-record.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAttendanceRecordInput extends PartialType(CreateAttendanceRecordInput) {
  @Field(() => Int)
  id: number;
}
