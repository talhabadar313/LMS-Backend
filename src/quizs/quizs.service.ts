import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { In, Repository } from 'typeorm';
import { Batch } from '../batch/entities/batch.entity';
import { Topic } from '../topics/entities/topic.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class QuizsService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createQuizInput: CreateQuizInput): Promise<Quiz> {
    const {
      batchId,
      topicId,
      title,
      createdBy,
      Date,
      totalmarks,
      marksBreakDown,
    } = createQuizInput;
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }
    if (!topicId) {
      throw new BadRequestException('TopicId is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const topics = await this.topicRepository.find({
      where: { topic_id: In(topicId) },
    });

    if (topics.length === 0) {
      throw new BadRequestException('One or more TopicIds are invalid');
    }

    const user = await this.userRepository.findOneBy({ user_id: createdBy });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newQuiz = await this.quizRepository.create({
      title,
      createdBy: user,
      Date,
      topics,
      totalmarks,
      batch,
      marksBreakDown,
    });

    return await this.quizRepository.save(newQuiz);
  }

  async findAll(batchId: string): Promise<Quiz[]> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    return await this.quizRepository.find({
      where: { batch: batch },
      relations: ['batch', 'topics', 'createdBy'],
    });
  }

  update(id: string, updateQuizInput: UpdateQuizInput) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: string) {
    return `This action removes a #${id} quiz`;
  }
}
