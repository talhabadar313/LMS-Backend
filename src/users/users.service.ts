import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Batch } from '../batch/entities/batch.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { MailService } from '../mail/mail.service';
import { WatchlistUserInput } from './dto/watchlist-user-input';
import { AttendanceStatus } from '../util/enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,

    private readonly mailService: MailService,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserInput.password,
      saltRounds,
    );

    const userData: Partial<User> = {
      name: createUserInput.name,
      email: createUserInput.email,
      password: hashedPassword,
      role: createUserInput.role,
      phoneNumber: createUserInput.phoneNumber,
      status: createUserInput.status,
      watchlisted: createUserInput.role === 'student' ? false : null,
      terminated: createUserInput.role === 'student' ? false : null,
    };

    if (createUserInput.role === 'student' && !createUserInput.status) {
      userData.status = 'Registered';
    }

    if (createUserInput.batchId) {
      const batch = await this.batchRepository.findOne({
        where: { batch_id: createUserInput.batchId },
      });
      if (!batch) {
        throw new Error('Batch not found');
      }
      userData.batch = batch;
    }

    if (createUserInput.candidateId) {
      const candidate = await this.candidateRepository.findOne({
        where: { candidate_id: createUserInput.candidateId },
      });
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      userData.candidate = candidate;
    }

    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['batch', 'candidate'] });
  }

  findOne(user_id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { user_id },
      relations: ['batch', 'candidate', 'notes', 'notes.createdBy'],
    });
  }

  async findStudentCountsData(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const user = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: [
        'batch',
        'batch.assignments',
        'batch.quizzes',
        'submissions',
        'submissions.assignment',
        'submissions.quiz',
        'attendanceRecords',
        'attendanceRecords.attendance',
      ],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const completedClassesSet = new Set(
      user.attendanceRecords.map((record) => record.attendance.attendance_id),
    );

    user.totalClasses = completedClassesSet.size;
    const totalAssignments = user.batch?.assignments?.length ?? 0;
    user.totalAssignments = totalAssignments;
    const totalQuizzes = user.batch?.quizzes?.length ?? 0;
    user.totalQuizzes = totalQuizzes;

    const attendedClasses = user.attendanceRecords.filter(
      (record) => record.status === AttendanceStatus.PRESENT,
    ).length;
    user.attendedClasses = attendedClasses;

    const submittedAssignments = user.submissions.filter(
      (submission) =>
        submission.assignment && submission.SubmittedData !== null,
    ).length;
    user.submittedAssignments = submittedAssignments;

    const attendedQuizzes = user.submissions.filter(
      (submission) => submission.quiz,
    ).length;
    user.attendedQuizzes = attendedQuizzes;

    return user;
  }

  async findRemindersandNotesData(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: [
        'batch',
        'batch.assignments',
        'batch.assignments.topics',
        'batch.quizzes',
        'batch.quizzes.topics',
        'notes',
        'notes.createdBy',
      ],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findStudentProgressData(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: [
        'submissions',
        'submissions.assignment',
        'submissions.assignment.topics',
        'submissions.quiz',
        'submissions.quiz.topics',
        'attendanceRecords',
        'attendanceRecords.attendance',
      ],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const totalClasses = user.attendanceRecords.length;
    const attendedClasses = user.attendanceRecords.filter(
      (record) => record.attendance,
    ).length;
    const attendanceScore =
      totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

    const assignmentScores = user.submissions
      .filter((submission) => submission.assignment)
      .map((submission) => ({
        obtainedMarks: submission.score || 0,
        totalMarks: submission.assignment.totalmarks || 100,
      }));

    const avgAssignmentScore =
      assignmentScores.length > 0
        ? assignmentScores.reduce(
            (sum, { obtainedMarks, totalMarks }) =>
              sum + (obtainedMarks / totalMarks) * 100,
            0,
          ) / assignmentScores.length
        : 0;

    console.log(assignmentScores);
    console.log(avgAssignmentScore);

    const quizScores = user.submissions
      .filter((submission) => submission.quiz)
      .map((submission) => ({
        obtainedMarks: submission.score || 0,
        totalMarks: submission.quiz.totalmarks || 100,
      }));

    const avgQuizScore =
      quizScores.length > 0
        ? quizScores.reduce(
            (sum, { obtainedMarks, totalMarks }) =>
              sum + (obtainedMarks / totalMarks) * 100,
            0,
          ) / quizScores.length
        : 0;

    // console.log(quizScores);
    // console.log(avgQuizScore);

    const attendanceWeight = 0.2;
    const assignmentWeight = 0.4;
    const quizWeight = 0.4;

    const overallScore =
      attendanceScore * attendanceWeight +
      avgAssignmentScore * assignmentWeight +
      avgQuizScore * quizWeight;

    user.overallScore = Math.round(overallScore);
    // console.log('Attendance Score:', attendanceScore);
    // console.log('Avg Assignment Score:', avgAssignmentScore);
    // console.log('Avg Quiz Score:', avgQuizScore);

    return user;
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['batch', 'candidate'],
    });
  }

  findTeachers(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'teacher' } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const tempPassword = this.generateTempPassword();
    user.password = await bcrypt.hash(tempPassword, 10);
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, tempPassword);
  }

  async resetPassword(
    user_id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const saltRounds = 10;
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return user;
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async update(
    user_id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    if (!user_id) {
      throw new BadRequestException('UserId is required');
    }
    const user = await this.userRepository.findOne({
      where: { user_id },
      relations: ['candidate'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const candidate = user.candidate;
    if (!candidate) {
      throw new BadRequestException('Candidate not found for this user');
    }

    candidate.name = updateUserInput.name;
    candidate.email = updateUserInput.email;
    candidate.phoneNo = updateUserInput.phoneNumber;
    candidate.address = updateUserInput.address;

    await this.candidateRepository.save(candidate);

    user.name = updateUserInput.name;
    user.email = updateUserInput.email;
    user.phoneNumber = updateUserInput.phoneNumber;
    await this.userRepository.save(user);

    return this.userRepository.findOne({
      where: { user_id },
      relations: ['batch', 'candidate'],
    });
  }

  async moveToWatchList(watchListUserInput: WatchlistUserInput): Promise<User> {
    const { userId, warning, reason } = watchListUserInput;
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.watchlisted = true;
    user.warning = warning;
    user.reason = reason;
    return this.userRepository.save(user);
  }

  async removeFromWatchList(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.watchlisted = false;
    user.warning = '';
    user.reason = '';
    return this.userRepository.save(user);
  }

  async remove(user_id: string): Promise<void> {
    await this.userRepository.delete(user_id);
  }

  async terminateStudent(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.terminated = true;
    return this.userRepository.save(user);
  }
}
