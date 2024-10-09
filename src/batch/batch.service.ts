import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { User } from '../users/entities/user.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { ApplicationsResponse } from '../candidates/dto/applications-response';
import { StudentResponse } from './dto/students-response';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { ChangeHistoryService } from 'src/changehistory/changehistory.service';
import { UpdateExistingBatchInput } from './dto/update-existingbatch-input';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,

    private readonly changeHistoryService: ChangeHistoryService,
  ) {}

  async create(createBatchInput: CreateBatchInput): Promise<Batch> {
    const { teacherIds, ...batchData } = createBatchInput;

    const user = await this.userRepository.findOneBy({
      user_id: createBatchInput.createdBy,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const batchInput = {
      ...batchData,
      createdBy: user,
    };

    const batch = this.batchRepository.create(batchInput);

    try {
      await this.batchRepository.save(batch);

      if (teacherIds && teacherIds.length > 0) {
        const teachers = await this.userRepository.find({
          where: { user_id: In(teacherIds) },
        });

        batch.teachers = teachers;
        await this.batchRepository.save(batch);
      }

      return this.batchRepository.findOne({
        where: { batch_id: batch.batch_id },
        relations: ['teachers', 'createdBy'],
      });
    } catch (error) {
      console.error('Error details:', error);
      throw new InternalServerErrorException('Error creating batch');
    }
  }

  async addTeachersToBatch(
    batchId: string,
    teacherIds: string[],
  ): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: ['teachers'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const teachers = await this.userRepository.find({
      where: { user_id: In(teacherIds) },
    });

    batch.teachers = [...batch.teachers, ...teachers];
    return this.batchRepository.save(batch);
  }

  async removeTeacherFromBatch(
    batchId: string,
    teacherId: string,
  ): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: ['teachers'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    batch.teachers = batch.teachers.filter(
      (teacher) => teacher.user_id !== teacherId,
    );
    return this.batchRepository.save(batch);
  }

  async findAll(): Promise<Batch[]> {
    const batches = await this.batchRepository.find({
      relations: ['teachers', 'candidates', 'createdBy'],
    });

    return batches.map((batch) => this.calculateOtherFields(batch));
  }

  private calculateOtherFields(batch: Batch): Batch {
    batch.totalCandidates = batch.candidates ? batch.candidates.length : 0;
    batch.interviewedCandidates = batch.candidates
      ? batch.candidates.filter(
          (candidate) => candidate.status === 'Interviewed',
        ).length
      : 0;
    batch.registeredCandidates = batch.candidates
      ? batch.candidates.filter(
          (candidate) => candidate.status === 'Registered',
        ).length
      : 0;

    return batch;
  }

  async findOne(batch_id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers', 'users', 'candidates', 'createdBy'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batch_id} not found`);
    }

    return this.calculateFields(batch);
  }

  private calculateFields(batch: Batch): Batch {
    if (batch.category === 'open') {
      if (batch.candidates) {
        batch.totalCandidates = batch.candidates.length;
        batch.maleCandidates = batch.candidates.filter(
          (candidate) => candidate.gender === 'male',
        ).length;
        batch.femaleCandidates = batch.candidates.filter(
          (candidate) => candidate.gender === 'female',
        ).length;
        batch.newCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'New',
        ).length;
        batch.interviewedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'Interviewed',
        ).length;
        batch.invitedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'Invited',
        ).length;
        batch.rejectedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'Rejected',
        ).length;
        batch.registeredCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'Registered',
        ).length;
      }
    } else {
      if (batch.users) {
        batch.totalCandidates = batch.users.length;
        batch.maleCandidates = batch.candidates.filter(
          (candidate) => candidate.gender === 'male',
        ).length;
        batch.femaleCandidates = batch.candidates.filter(
          (candidate) => candidate.gender === 'female',
        ).length;
        batch.interviewedCandidates = batch.users.filter(
          (user) => user.status === 'Interviewed',
        ).length;
        batch.registeredCandidates = batch.users.filter(
          (user) => user.status === 'Registered',
        ).length;
      }
    }

    return batch;
  }

  async update(
    batch_id: string,
    updateBatchInput: UpdateBatchInput,
  ): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batch_id} not found`);
    }

    Object.assign(batch, updateBatchInput);

    if (updateBatchInput.teacherIds) {
      const teachers = await this.userRepository.find({
        where: { user_id: In(updateBatchInput.teacherIds) },
      });

      batch.teachers = teachers;
    }

    await this.batchRepository.save(batch);

    return this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers', 'createdBy'],
    });
  }

  async remove(batch_id: string): Promise<void> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers', 'users'],
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batch_id} not found`);
    }

    batch.teachers = [];
    batch.users = [];
    await this.batchRepository.save(batch);

    await this.batchRepository.remove(batch);
  }

  async getApplicationsPerDay(batchId: string): Promise<ApplicationsResponse> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: ['candidates'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const candidates = batch.candidates;

    const daysOfWeek: ApplicationsResponse = {
      mondayApplications: 0,
      tuesdayApplications: 0,
      wednesdayApplications: 0,
      thursdayApplications: 0,
      fridayApplications: 0,
      saturdayApplications: 0,
      sundayApplications: 0,
    };

    candidates.forEach((candidate) => {
      const registrationDate = new Date(candidate.createdOn);
      const dayOfWeek = registrationDate.getDay();

      switch (dayOfWeek) {
        case 1:
          daysOfWeek.mondayApplications++;
          break;
        case 2:
          daysOfWeek.tuesdayApplications++;
          break;
        case 3:
          daysOfWeek.wednesdayApplications++;
          break;
        case 4:
          daysOfWeek.thursdayApplications++;
          break;
        case 5:
          daysOfWeek.fridayApplications++;
          break;
        case 6:
          daysOfWeek.saturdayApplications++;
          break;
        case 0:
          daysOfWeek.sundayApplications++;
          break;
      }
    });

    return daysOfWeek;
  }
  async findStudentsByBatchId(batchId: string): Promise<Batch> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    return await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: ['users'],
    });
  }
  async findStudentsDetailsByBatchId(
    batchId: string,
  ): Promise<StudentResponse[]> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: [
        'candidates',
        'candidates.user.attendanceRecords',
        'candidates.user.submissions',
        'candidates.user.submissions.assignment',
        'candidates.user',
      ],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const allAssignments = await this.assignmentRepository.find({
      where: { batch: { batch_id: batchId } },
    });

    const studentsDataWithAbsencesAndAssignments = await Promise.all(
      batch.candidates.map(async (candidate) => {
        const student = candidate?.user;

        const absences = student?.attendanceRecords.filter(
          (record) => record.status === 'absent',
        ).length;

        const studentSubmissions =
          student?.submissions?.filter(
            (submission) => submission?.assignment != null,
          ) || [];

        const assignments = allAssignments.map((assignment) => {
          const submission = studentSubmissions.find(
            (sub) =>
              sub?.assignment?.assignment_id === assignment?.assignment_id,
          );

          return {
            title: assignment?.title,
            totalmarks: assignment?.totalmarks,
            dueDate: assignment?.dueDate,
            score: submission ? submission?.score : null,
          };
        });

        return {
          candidate_id: candidate?.candidate_id,
          student_id: student?.user_id,
          name: candidate?.name,
          email: candidate?.email,
          status: candidate?.status,
          watchlisted: student?.watchlisted,
          terminated: student?.terminated,
          gender: candidate?.gender,
          age: candidate?.age,
          laptopAvailability: candidate?.laptopAvailability,
          qualification: candidate?.qualification,
          institutionName: candidate?.institutionName,
          allotedHours: candidate?.allocatedHours,
          purpose: candidate?.purpose,
          phoneNo: candidate?.phoneNo,
          warning: student?.warning,
          reason: student?.reason,
          batchId: batch?.batch_id,
          batchName: batch?.name,
          absences: absences,
          assignments: assignments,
        };
      }),
    );

    return studentsDataWithAbsencesAndAssignments;
  }

  async updateClassTimings(
    batchId: string,
    newTimings: string,
    changedBy: string,
  ): Promise<Batch> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    if (!changedBy) {
      throw new BadRequestException('ChangedBy is required');
    }

    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
    });

    const user = await this.userRepository.findOne({
      where: { user_id: changedBy },
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }
    const oldTimings = batch.classTimings;
    batch.classTimings = newTimings;

    if (oldTimings !== newTimings) {
      await this.changeHistoryService.addClassTimingsChangeHistory(
        batch.batch_id,
        newTimings,
        (changedBy = user.user_id),
      );
    }

    return this.batchRepository.save(batch);
  }

  async updateExistingBatch(
    updateExistingBatchInput: UpdateExistingBatchInput,
  ): Promise<Batch> {
    const {
      batch_id,
      teacherIds,
      name,
      maxAbsents,
      defaultMessage,
      movePupils,
    } = updateExistingBatchInput;

    if (!batch_id) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchRepository.findOneBy({
      batch_id: batch_id,
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    if (!teacherIds || teacherIds.length === 0) {
      throw new BadRequestException('TeacherIds are required');
    }

    const teachers = await this.userRepository.find({
      where: { user_id: In(teacherIds) },
    });

    if (!teachers || teachers.length === 0) {
      throw new BadRequestException('Teachers not found');
    }

    batch.name = name;
    batch.teachers = teachers;

    if (movePupils) {
      const pupils = await this.userRepository.find({
        where: { batch: batch },
        relations: ['attendanceRecords'],
      });

      let studentsMovedToWatchlist = 0;

      for (const pupil of pupils) {
        const absences = pupil.attendanceRecords.filter(
          (record) => record.status === 'absent',
        ).length;

        if (absences > maxAbsents) {
          pupil.watchlisted = true;
          pupil.warning = defaultMessage;
          studentsMovedToWatchlist++;
          console.log(
            `Pupil ${pupil.user_id} added to watchlist with absences: ${absences}`,
          );
        } else {
          pupil.watchlisted = false;
          pupil.warning = null;
        }

        pupil.absences = absences;
      }

      await this.userRepository.save(pupils);

      console.log(`${studentsMovedToWatchlist} students moved to watchlist.`);
    }

    return this.batchRepository.save(batch);
  }
}
