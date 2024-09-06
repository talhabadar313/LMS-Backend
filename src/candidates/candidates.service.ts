import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';
import { Batch } from 'src/batch/entities/batch.entity'; 
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,

    @InjectRepository(Batch) 
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User) 
    private readonly userRepository: Repository<User>
  ) {}

  async create(createCandidateInput: CreateCandidateInput): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createCandidateInput);

    if (createCandidateInput.batchId) {
      const batch = await this.batchRepository.findOne({ where: { batch_id: createCandidateInput.batchId } });
      if (!batch) {
        throw new Error('Batch not found');
      }
      candidate.batch = batch;
    }

    return this.candidateRepository.save(candidate);
  }

  findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({ relations: ['user', 'batch'] });
  }
  async findByBatchId(batchId: string): Promise<Candidate[]> {
    const candidates = await this.candidateRepository.find({
      where: { batch: { batch_id: batchId } },
      relations: ['user', 'batch'],
    });
    
    console.log('Fetched candidates:', candidates);
 
    candidates.forEach(candidate => {
      if (!candidate.candidate_id) {
        console.error('Candidate with null ID:', candidate); 
      }
    });
  
    return candidates;
  }
  

  findOne(id: string): Promise<Candidate> {
    return this.candidateRepository.findOne({ where: { candidate_id: id }, relations: ['user', 'batch'] });
  }

  async update(id: string, updateCandidateInput: UpdateCandidateInput): Promise<Candidate> {
   
    const candidate = await this.candidateRepository.findOne({
      where: { candidate_id: id },
      relations: ['batch', 'user'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    if (updateCandidateInput.batchName) {
      const batch = await this.batchRepository.findOne({ where: { name: updateCandidateInput.batchName } });
      if (!batch) {
        throw new NotFoundException(`Batch with name ${updateCandidateInput.batchName} not found`);
      }
      candidate.batch = batch;
    }

    Object.assign(candidate, updateCandidateInput);

    await this.candidateRepository.save(candidate);

    if (updateCandidateInput.status === 'registered') {
      if (candidate.user) {
        candidate.user.name = candidate.name;
        candidate.user.email = candidate.email;
        candidate.user.phoneNumber = candidate.phoneNo;
        candidate.user.status = candidate.status;
        candidate.user.batch = candidate.batch; 
        await this.userRepository.save(candidate.user);
      } else {
        const newUser = new User();
        newUser.name = candidate.name;
        newUser.email = candidate.email;
        newUser.password = 'default123'; 
        newUser.role = 'student';
        newUser.phoneNumber = candidate.phoneNo;
        newUser.status = candidate.status;
        newUser.batch = candidate.batch; 
        newUser.candidate = candidate;
        await this.userRepository.save(newUser);
      }
    }

    return this.candidateRepository.findOne({
      where: { candidate_id: id },
      relations: ['batch', 'user'],
    });
}


  

  async remove(id: string): Promise<void> {
    await this.candidateRepository.delete(id);
  }
}
