import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
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
  
  async addTeachersToBatch(batchId: string, teacherIds: string[]): Promise<Batch> {
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

  
  async removeTeacherFromBatch(batchId: string, teacherId: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
      relations: ['teachers'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    
    batch.teachers = batch.teachers.filter(teacher => teacher.user_id !== teacherId);
    return this.batchRepository.save(batch);
  }

  
  async findAll(): Promise<Batch[]> {
    return this.batchRepository.find({ relations: ['teachers', 'users' , 'candidates'] });
  }

 
  async findOne(batch_id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
      relations: ['teachers' , 'users' , 'candidates'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batch_id} not found`);
    }

    return batch;
  }

  async update(batch_id: string, updateBatchInput: UpdateBatchInput): Promise<Batch> {
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
    const batch = await this.batchRepository.findOne({ where: { batch_id }, relations: ['teachers', 'users'] });
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
  }
  