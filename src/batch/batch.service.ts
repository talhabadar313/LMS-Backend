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

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createBatchInput: CreateBatchInput): Promise<Batch> {
    const { teacherIds, ...batchData } = createBatchInput;
    const batch = this.batchRepository.create(batchData);

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
        relations: ['teachers'],
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
      relations: ['teachers', 'candidates'],
    });

    return batches.map((batch) => this.calculateOtherFields(batch));
  }

  private calculateOtherFields(batch: Batch): Batch {
    batch.totalCandidates = batch.candidates ? batch.candidates.length : 0;
    batch.interviewedCandidates = batch.candidates
      ? batch.candidates.filter(
          (candidate) => candidate.status === 'interviewed',
        ).length
      : 0;
    batch.registeredCandidates = batch.candidates
      ? batch.candidates.filter(
          (candidate) => candidate.status === 'registered',
        ).length
      : 0;

    return batch;
  }

  async findOne(batch_id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers', 'users', 'candidates'],
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
          (candidate) => candidate.status === 'new',
        ).length;
        batch.interviewedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'interviewed',
        ).length;
        batch.invitedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'invited',
        ).length;
        batch.rejectedCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'rejected',
        ).length;
        batch.registeredCandidates = batch.candidates.filter(
          (candidate) => candidate.status === 'registered',
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
          (user) => user.status === 'interviewed',
        ).length;
        batch.registeredCandidates = batch.users.filter(
          (user) => user.status === 'registered',
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
      relations: ['teachers'],
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
}
