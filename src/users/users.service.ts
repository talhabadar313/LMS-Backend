import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Batch } from 'src/batch/entities/batch.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>
  ) {}


  async create(createUserInput: CreateUserInput): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserInput.password, saltRounds);

    const userData: Partial<User> = {
      name: createUserInput.name,
      email: createUserInput.email,
      password: hashedPassword,
      role: createUserInput.role,
      phoneNumber: createUserInput.phoneNumber,
      status: createUserInput.status,
      watchlisted: createUserInput.role === 'student' ? false : null,
    };

    if (createUserInput.role === 'student' && !createUserInput.status) {
      userData.status = 'registered';
    }

    if (createUserInput.batchId) {
      const batch = await this.batchRepository.findOne({ where: { batch_id: createUserInput.batchId } });
      if (!batch) {
        throw new Error('Batch not found');
      }
      userData.batch = batch;
    }

    if (createUserInput.candidateId) {
      const candidate = await this.candidateRepository.findOne({ where: { candidate_id: createUserInput.candidateId } });
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
    return this.userRepository.findOne({ where: { user_id }, relations: ['batch', 'candidate'] });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email }, relations: ['batch', 'candidate'] });
  }

  findTeachers(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'teacher' }});
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }


  async update(user_id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const saltRounds = 10;

    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, saltRounds);
    }

    await this.userRepository.update(user_id, updateUserInput);
    return this.userRepository.findOne({ where: { user_id }, relations: ['batch', 'candidate'] });
  }


  async remove(user_id: string): Promise<void> {
    await this.userRepository.delete(user_id);
  }
}