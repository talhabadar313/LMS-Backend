import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';
import { Batch } from '../batch/entities/batch.entity'; 
import { User } from '../users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,

    @InjectRepository(Batch) 
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,

    private readonly mailService: MailService,
  ) {}

  async create(createCandidateInput: CreateCandidateInput): Promise<Candidate> {
    if (!createCandidateInput.batchId) {
      throw new BadRequestException('Batch ID is required.');
    }

    const batch = await this.batchRepository.findOne({ 
      where: { batch_id: createCandidateInput.batchId }
    });

    if (!batch) {
      throw new NotFoundException('Batch not found.');
    }

    if (batch.category !== 'open') {
      throw new BadRequestException('Batch is closed. Cannot add candidates.');
    }

    const candidate = this.candidateRepository.create(createCandidateInput);
    candidate.batch = batch;

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
    return this.candidateRepository.findOne({ 
      where: { candidate_id: id }, 
      relations: ['user', 'batch'] 
    });
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


   
    if (updateCandidateInput.status === 'invited') {
     
      const tempPassword = this.generateTempPassword();
      const loginUrl = "https://lms-alpha-five.vercel.app/"
      
      await this.mailService.sendInvitationEmail(candidate.email, candidate.name, tempPassword, loginUrl);

    }

    if (updateCandidateInput.status === 'rejected') {
      await this.mailService.sendRejectionEmail(candidate.email, candidate.name);
    }
   
    if (updateCandidateInput.status === 'registered') {
    
      if (!candidate.user) {
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
      } else {
       
        candidate.user.status = 'registered';
        candidate.user.name = candidate.name;
        candidate.user.email = candidate.email;
        candidate.user.phoneNumber = candidate.phoneNo;
        candidate.user.batch = candidate.batch;
        await this.userRepository.save(candidate.user);
      }
    }

    
    await this.candidateRepository.save(candidate);

    return this.candidateRepository.findOne({
      where: { candidate_id: id },
      relations: ['batch', 'user'],
    });
  }

 
  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8); 
  }
  async remove(id: string): Promise<void> {
    await this.candidateRepository.delete(id);
  }
}
