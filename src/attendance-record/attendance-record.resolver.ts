import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AttendanceRecordService } from './attendance-record.service';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { CreateAttendanceRecordInput } from './dto/create-attendance-record.input';
import { UpdateAttendanceRecordInput } from './dto/update-attendance-record.input';

@Resolver(() => AttendanceRecord)
export class AttendanceRecordResolver {
  constructor(
    private readonly attendanceRecordService: AttendanceRecordService,
  ) {}

  @Mutation(() => [AttendanceRecord])
  async createAttendanceRecord(
    @Args('createAttendanceRecordInput')
    createAttendanceRecordInput: CreateAttendanceRecordInput,
  ): Promise<AttendanceRecord[]> {
    return this.attendanceRecordService.create(createAttendanceRecordInput);
  }

  @Query(() => [AttendanceRecord], {
    name: 'getAttendanceRecordByAttendanceSession',
  })
  findAll(@Args('attendanceId', { type: () => String }) attendanceId: string) {
    return this.attendanceRecordService.findAll(attendanceId);
  }

  @Query(() => AttendanceRecord, { name: 'attendanceRecord' })
  findOne(@Args('recordId', { type: () => String }) recordId: string) {
    return this.attendanceRecordService.findOne(recordId);
  }

  @Mutation(() => [AttendanceRecord], { name: 'updateAttendanceRecord' })
  async updateAttendanceRecord(
    @Args('updateAttendanceRecordInput')
    updateAttendanceRecordInput: UpdateAttendanceRecordInput,
  ): Promise<AttendanceRecord[]> {
    const records = await this.attendanceRecordService.update(
      updateAttendanceRecordInput,
    );

    return records;
  }
}
