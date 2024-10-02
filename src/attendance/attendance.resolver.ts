import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceInput } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';

@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Mutation(() => Attendance, { name: 'createAttendance' })
  createAttendance(
    @Args('createAttendanceInput') createAttendanceInput: CreateAttendanceInput,
  ) {
    return this.attendanceService.create(createAttendanceInput);
  }

  @Query(() => [Attendance], { name: 'getAllAttendancesByBatch' })
  findAll(@Args('batchId', { type: () => String }) batchId: string) {
    return this.attendanceService.findAll(batchId);
  }

  @Query(() => Attendance, { name: 'attendance' })
  findOne(@Args('attendanceId', { type: () => String }) attendanceId: string) {
    return this.attendanceService.findOne(attendanceId);
  }

  @Mutation(() => Attendance, { name: 'updateAttendance' })
  updateAttendance(
    @Args('updateAttendanceInput') updateAttendanceInput: UpdateAttendanceInput,
  ) {
    return this.attendanceService.update(updateAttendanceInput);
  }

  @Mutation(() => Attendance)
  removeAttendance(
    @Args('attendanceId', { type: () => String }) attendanceId: string,
  ) {
    return this.attendanceService.remove(attendanceId);
  }
}
