import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceRecordInput } from './dto/create-attendance-record.input';
import { UpdateAttendanceRecordInput } from './dto/update-attendance-record.input';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { Batch } from '../batch/entities/batch.entity';

@Injectable()
export class AttendanceRecordService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}
  async create(
    createAttendanceRecordInput: CreateAttendanceRecordInput,
  ): Promise<AttendanceRecord[]> {
    const { attendanceId, studentIds, status, markedBy } =
      createAttendanceRecordInput;

    if (!attendanceId) {
      throw new BadRequestException('attendanceId is required');
    }
    if (!studentIds || studentIds.length === 0) {
      throw new BadRequestException('At least one student is required');
    }
    if (!markedBy) {
      throw new BadRequestException('markedBy is required');
    }
    if (!status || status.length !== studentIds.length) {
      throw new BadRequestException('Status must match the number of students');
    }

    const attendance = await this.attendanceRepository.findOne({
      where: { attendance_id: attendanceId },
      relations: ['batch'],
    });
    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    const user = await this.userRepository.findOneBy({ user_id: markedBy });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!attendance.batch) {
      throw new BadRequestException('Attendance batch not found');
    }

    const batch = await this.batchRepository.findOne({
      where: { batch_id: attendance.batch.batch_id },
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const attendanceRecords: AttendanceRecord[] = [];

    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      const studentStatus = status[i];

      const student = await this.userRepository.findOneBy({
        user_id: studentId,
      });
      if (!student) {
        throw new BadRequestException(`Student not found: ${studentId}`);
      }

      const attendanceRecord = this.attendanceRecordRepository.create({
        attendance,
        student: student,
        status: studentStatus,
        markedBy: user,
      });

      const savedRecord =
        await this.attendanceRecordRepository.save(attendanceRecord);
      attendanceRecords.push(savedRecord);

      const studentAttendanceRecords =
        await this.attendanceRecordRepository.find({
          where: { student: { user_id: studentId } },
        });

      const absences =
        studentAttendanceRecords.filter((record) => record.status === 'absent')
          .length || 0;

      if (absences > batch.maxAbsents) {
        student.watchlisted = true;
        student.warning =
          'You are on watchlist! Please Be Regular! Your absences exceeds the max allowed absences';
        student.reason = 'Lack of attendance';
        console.log(
          `Student ${student.user_id} added to the watchlist with ${absences} absences.`,
        );
      } else {
        if (student.reason === 'Lack of attendance') {
          student.watchlisted = false;
          student.warning = null;
          student.reason = null;
          console.log(`Student ${student.user_id} unwatchlisted.`);
        }
      }

      await this.userRepository.save(student);
    }
    return attendanceRecords;
  }

  async findAll(attendanceId: string): Promise<AttendanceRecord[]> {
    if (!attendanceId) {
      throw new BadRequestException('attendanceId is required');
    }
    const attendance = await this.attendanceRepository.findOneBy({
      attendance_id: attendanceId,
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    const attendanceRecords = await this.attendanceRecordRepository.find({
      where: { attendance: attendance },
      relations: ['attendance', 'student', 'markedBy'],
    });
    return attendanceRecords;
  }

  findOne(id: string) {
    return `This action returns a #${id} attendanceRecord`;
  }

  async update(
    updateAttendanceRecordInput: UpdateAttendanceRecordInput,
  ): Promise<AttendanceRecord[]> {
    const attendanceRecords: AttendanceRecord[] = [];

    const { studentIds, status, attendanceId } = updateAttendanceRecordInput;

    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      const studentStatus = status[i];

      const student = await this.userRepository.findOneBy({
        user_id: studentId,
      });
      if (!student) {
        throw new BadRequestException(`Student not found: ${studentId}`);
      }

      const attendance = await this.attendanceRepository.findOne({
        where: { attendance_id: attendanceId },
        relations: ['batch'],
      });
      if (!attendance) {
        throw new BadRequestException('Attendance not found');
      }

      if (!attendance.batch) {
        throw new BadRequestException('Attendance batch not found');
      }

      const batch = await this.batchRepository.findOne({
        where: { batch_id: attendance.batch.batch_id },
      });

      if (!batch) {
        throw new BadRequestException('Batch not found');
      }

      const existingRecord = await this.attendanceRecordRepository.findOne({
        where: { attendance: { attendance_id: attendanceId }, student },
      });

      if (existingRecord) {
        existingRecord.status = studentStatus;
        const updatedRecord =
          await this.attendanceRecordRepository.save(existingRecord);
        attendanceRecords.push(updatedRecord);
      } else {
        const newRecord = this.attendanceRecordRepository.create({
          attendance: { attendance_id: attendanceId },
          student,
          status: studentStatus,
        });
        const savedRecord =
          await this.attendanceRecordRepository.save(newRecord);
        attendanceRecords.push(savedRecord);
      }

      const studentAttendanceRecords =
        await this.attendanceRecordRepository.find({
          where: { student: { user_id: studentId } },
        });

      const absences =
        studentAttendanceRecords.filter((record) => record.status === 'absent')
          .length || 0;

      if (absences > batch.maxAbsents) {
        student.watchlisted = true;
        student.warning =
          'You are on watchlist! Please Be Regular! Your absences exceed the max allowed absences';
        student.reason = 'Lack of attendance';
        console.log(
          `Student ${student.user_id} added to the watchlist with ${absences} absences.`,
        );
      } else {
        if (student.reason === 'Lack of attendance') {
          student.watchlisted = false;
          student.warning = null;
          student.reason = null;
          console.log(`Student ${student.user_id} unwatchlisted.`);
        }
      }

      await this.userRepository.save(student);
    }
    return attendanceRecords;
  }
}
