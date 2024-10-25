import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeHistory } from './entities/changehistory.entity';
import { Repository } from 'typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChangeHistoryService {
  constructor(
    @InjectRepository(ChangeHistory)
    private readonly changeHistoryRepository: Repository<ChangeHistory>,

    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async addChangeHistory(
    candidateId: string,
    newStatus: string,
    oldStatus: string,
  ) {
    if (!candidateId) {
      throw new BadRequestException('Candidate Id is required');
    }

    const candidate = await this.candidateRepository.findOneBy({
      candidate_id: candidateId,
    });

    if (!candidate) {
      throw new BadRequestException('Candidate not found');
    }

    const changeHistory = this.changeHistoryRepository.create({
      oldStatus: oldStatus,
      newStatus: newStatus,
      candidate: candidate,
    });

    return this.changeHistoryRepository.save(changeHistory);
  }

  async getChangeHistoryByCandidateId(candidateId: string) {
    return this.changeHistoryRepository.find({
      where: { candidate: { candidate_id: candidateId } },
      order: { changeDate: 'DESC' },
    });
  }

  async getClassTimingsChangeHistory(batchId: string) {
    return this.changeHistoryRepository.find({
      where: { batch: { batch_id: batchId } },
      order: { changeDate: 'DESC' },
      relations: ['changedBy'],
    });
  }

  async addClassTimingsChangeHistory(
    batchId: string,
    newTimings: string,
    changedBy: string,
  ) {
    if (!batchId) {
      throw new BadRequestException('Batch Id is required');
    }
    if (!changedBy) {
      throw new BadRequestException('Changed By is required');
    }
    const batch = await this.batchRepository.findOneBy({
      batch_id: batchId,
    });

    const user = await this.userRepository.findOneBy({
      user_id: changedBy,
    });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const oldTimings = batch.classTimings;

    const changeHistory = this.changeHistoryRepository.create({
      oldTimings,
      newTimings,
      batch,
      changedBy: user,
    });

    return this.changeHistoryRepository.save(changeHistory);
  }
}
