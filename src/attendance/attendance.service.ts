import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceInput } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { Attendance } from './entities/attendance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import { AttendanceRecord } from 'src/attendance-record/entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,
  ) {}
  async create(
    createAttendanceInput: CreateAttendanceInput,
  ): Promise<Attendance> {
    const { sessionDate, sessionName, batchId, createdBy } =
      createAttendanceInput;
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }
    if (!createdBy) {
      throw new BadRequestException('CreatedBy is required');
    }
    if (!sessionDate) {
      throw new BadRequestException('SessionDate is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const user = await this.userRepository.findOneBy({ user_id: createdBy });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const attendance = this.attendanceRepository.create({
      sessionName: sessionName,
      sessionDate: new Date(sessionDate).toISOString(),
      batch: batch,
      createdBy: user,
    });
    return this.attendanceRepository.save(attendance);
  }

  async findAll(batchId: string): Promise<Attendance[]> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const attendances = await this.attendanceRepository.find({
      where: { batch: batch },
      relations: ['batch', 'createdBy'],
    });

    for (const attendance of attendances) {
      const attendanceRecords = await this.attendanceRecordRepository.find({
        where: { attendance: attendance },
        relations: ['attendance', 'student', 'markedBy'],
      });

      (attendance as any).attendanceRecords = attendanceRecords;
    }

    return attendances;
  }

  findOne(attendanceId: string) {
    return `This action returns a #${attendanceId} attendance`;
  }

  async update(updateAttendanceInput: UpdateAttendanceInput) {
    const { attendanceId, sessionDate, sessionName } = updateAttendanceInput;
    if (!attendanceId) {
      throw new BadRequestException('AttendanceId is required');
    }
    if (!sessionDate) {
      throw new BadRequestException('SessionDate is required');
    }

    const attendance = await this.attendanceRepository.findOneBy({
      attendance_id: attendanceId,
    });

    if (!attendance) {
      throw new BadRequestException('Attendance Session Not Found');
    }

    attendance.sessionName = sessionName;
    attendance.sessionDate = new Date(sessionDate).toISOString();
    return this.attendanceRepository.save(attendance);
  }

  async remove(attendanceId: string): Promise<{ attendance_id: string }> {
    if (!attendanceId) {
      throw new BadRequestException('AttendanceId is required');
    }
    const attendance = await this.attendanceRepository.findOneBy({
      attendance_id: attendanceId,
    });

    if (!attendance) {
      throw new BadRequestException('Attendance Not Found');
    }

    await this.attendanceRepository.remove(attendance);

    return { attendance_id: attendanceId };
  }
}
