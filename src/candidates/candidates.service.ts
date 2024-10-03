import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { ChangeHistoryService } from '../changehistory/changehistory.service';

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

    private readonly changeHistoryService: ChangeHistoryService,
  ) {}

  async create(createCandidateInput: CreateCandidateInput): Promise<Candidate> {
    if (!createCandidateInput.batchId) {
      throw new BadRequestException('Batch ID is required.');
    }

    const batch = await this.batchRepository.findOne({
      where: { batch_id: createCandidateInput.batchId },
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

  async findCandidateByEmail(email: string): Promise<Candidate | undefined> {
    return this.candidateRepository.findOne({
      where: { email },
      relations: ['batch', 'user'],
    });
  }

  async findByBatchId(batchId: string): Promise<Candidate[]> {
    const candidates = await this.candidateRepository.find({
      where: { batch: { batch_id: batchId } },
      relations: ['user', 'batch'],
    });

    console.log('Fetched candidates:', candidates);

    candidates.forEach((candidate) => {
      if (!candidate.candidate_id) {
        console.error('Candidate with null ID:', candidate);
      }
    });

    return candidates;
  }

  findOne(id: string): Promise<Candidate> {
    return this.candidateRepository.findOne({
      where: { candidate_id: id },
      relations: ['user', 'batch'],
    });
  }

  async resetPassword(
    email: string,
    tempPassword: string,
    newPassword: string,
  ): Promise<Candidate> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const candidate = await this.candidateRepository.findOne({
      where: { email: email },
      relations: ['batch'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with email ${email} not found`);
    }

    const oldStatus = candidate.status;
    candidate.status = 'Registered';
    candidate.tempPassword = null;

    await this.candidateRepository.save(candidate);

    if (oldStatus !== candidate.status) {
      await this.changeHistoryService.addChangeHistory(
        candidate,
        oldStatus,
        candidate.status,
      );
    }

    let user = await this.userRepository.findOne({
      where: { candidate: candidate },
    });

    if (!user) {
      user = new User();
      user.name = candidate.name;
      user.email = candidate.email;
      user.password = hashedPassword;
      user.role = 'student';
      user.phoneNumber = candidate.phoneNo;
      user.status = 'Registered';
      user.batch = candidate.batch;
      user.candidate = candidate;
    } else {
      user.password = hashedPassword;
      user.status = 'Registered';
      user.name = candidate.name;
      user.email = candidate.email;
      user.phoneNumber = candidate.phoneNo;
      user.batch = candidate.batch;
    }

    await this.userRepository.save(user);

    return candidate;
  }

  async update(
    id: string,
    updateCandidateInput: UpdateCandidateInput,
  ): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { candidate_id: id },
      relations: ['batch', 'user'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    const oldStatus = candidate.status;

    if (oldStatus === 'Registered') {
      console.log(`Updating user for candidate ID: ${candidate.candidate_id}`);

      const user = await this.userRepository.findOne({
        where: { candidate: candidate },
      });

      if (!user) {
        throw new NotFoundException(
          `User associated with candidate ID ${id} not found`,
        );
      }

      user.name = candidate.name;
      user.phoneNumber = candidate.phoneNo;
      await this.userRepository.save(user);
    }

    if (updateCandidateInput.batchName) {
      const batch = await this.batchRepository.findOne({
        where: { name: updateCandidateInput.batchName },
      });
      if (!batch) {
        throw new NotFoundException(
          `Batch with name ${updateCandidateInput.batchName} not found`,
        );
      }
      candidate.batch = batch;
    }

    Object.assign(candidate, updateCandidateInput);

    if (updateCandidateInput.status === 'Invited') {
      const tempPassword = this.generateTempPassword();
      candidate.tempPassword = tempPassword;
      const loginUrl = 'https://lms-alpha-five.vercel.app/';

      await this.mailService.sendInvitationEmail(
        candidate.email,
        candidate.name,
        tempPassword,
        loginUrl,
      );
    }

    if (updateCandidateInput.status === 'Rejected') {
      await this.mailService.sendRejectionEmail(
        candidate.email,
        candidate.name,
      );
    }

    await this.candidateRepository.save(candidate);

    const newStatus = candidate.status;

    if (oldStatus !== newStatus) {
      await this.changeHistoryService.addChangeHistory(
        candidate,
        oldStatus,
        newStatus,
      );
    }

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
  async save(candidate: Candidate): Promise<Candidate> {
    return this.candidateRepository.save(candidate);
  }
}
