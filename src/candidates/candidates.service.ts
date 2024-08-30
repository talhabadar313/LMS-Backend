import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  create(createCandidateInput: CreateCandidateInput): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createCandidateInput);
    return this.candidateRepository.save(candidate);
  }

  findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({ relations: ['user'] });
  }

  findOne(id: string): Promise<Candidate> {
    return this.candidateRepository.findOne({ where: { candidate_id: id }, relations: ['user'] });
  }

  async update(id: string, updateCandidateInput: UpdateCandidateInput): Promise<Candidate> {
    await this.candidateRepository.update(id, updateCandidateInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.candidateRepository.delete(id);
  }
}
