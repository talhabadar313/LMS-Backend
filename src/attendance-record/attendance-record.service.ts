import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceRecordInput } from './dto/create-attendance-record.input';
import { UpdateAttendanceRecordInput } from './dto/update-attendance-record.input';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Repository } from 'typeorm';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AttendanceRecordService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const attendance = await this.attendanceRepository.findOneBy({
      attendance_id: attendanceId,
    });
    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    const user = await this.userRepository.findOneBy({ user_id: markedBy });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const attendanceRecords = [];

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
        student,
        status: studentStatus,
        markedBy: user,
      });

      const savedRecord =
        await this.attendanceRecordRepository.save(attendanceRecord);
      attendanceRecords.push(savedRecord);
    }
    console.log('Saved attendance records:', attendanceRecords);
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

  update(updateAttendanceRecordInput: UpdateAttendanceRecordInput) {
    return `This action updates a attendanceRecord`;
  }
}
