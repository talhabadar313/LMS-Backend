import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeHistory } from './entities/changehistory.entity';
import { Repository } from 'typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';

@Injectable()
export class ChangeHistoryService {
  constructor(
    @InjectRepository(ChangeHistory)
    private readonly changeHistoryRepository: Repository<ChangeHistory>,
  ) {}
  async addChangeHistory(candidate: Candidate, oldStatus: string, newStatus: string) {
    const changeHistory = this.changeHistoryRepository.create({
      oldStatus,
      newStatus,
      candidate,
    });
  
    console.log('Saving change history:', changeHistory);
    return this.changeHistoryRepository.save(changeHistory);
  }
  

  async getChangeHistoryByCandidateId(candidateId: string) {
    return this.changeHistoryRepository.find({
      where: { candidate: { candidate_id: candidateId } },
      order: { changeDate: 'DESC' },
    });
  }
}
