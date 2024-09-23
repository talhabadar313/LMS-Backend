import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTopicInput } from './dto/create-topic.input';
import { UpdateTopicInput } from './dto/update-topic.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from '../batch/entities/batch.entity';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async create(createTopicInput: CreateTopicInput): Promise<Topic> {
    const { batch_id, name } = createTopicInput;
    if (!batch_id || !name) {
      throw new BadRequestException('batchId and name are required');
    }
    const batch = await this.batchRepository.findOneBy({ batch_id: batch_id });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }
    const newTopic = this.topicRepository.create({ name, batch });
    return await this.topicRepository.save(newTopic);
  }

  async findAll(batchId: string): Promise<Topic[]> {
    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }
    return await this.topicRepository.findBy({ batch });
  }

  async update(id: string, updateTopicInput: UpdateTopicInput): Promise<Topic> {
    const topic = await this.topicRepository.findOneBy({ topic_id: id });
    if (!topic) {
      throw new BadRequestException('Topic Not Found');
    }
    await this.topicRepository.save(updateTopicInput);
    return await this.topicRepository.findOneBy({ topic_id: id });
  }

  async remove(id: string): Promise<String> {
    const topic = await this.topicRepository.findOneBy({ topic_id: id });
    if (!topic) {
      throw new BadRequestException('Topic not found');
    }
    await this.topicRepository.remove(topic);
    return 'Topic has been removed';
  }
}
