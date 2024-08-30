import { Injectable } from '@nestjs/common';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  create(createBatchInput: CreateBatchInput): Promise<Batch> {
    
    const batch = this.batchRepository.create(createBatchInput);
    return this.batchRepository.save(batch);
  }

  findAll(): Promise<Batch[]> {
    return this.batchRepository.find({relations:['users']});
  }

  findOne(batch_id: string): Promise<Batch> {
    return this.batchRepository.findOneBy({ batch_id });
  }

  async update(batch_id: string, updateBatchInput: UpdateBatchInput): Promise<Batch> {
    await this.batchRepository.update(batch_id, updateBatchInput);
    return this.batchRepository.findOneBy({ batch_id });
  }

  async remove(batch_id: string): Promise<void> {
    await this.batchRepository.delete({ batch_id });
  }
}
