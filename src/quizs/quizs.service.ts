import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { In, Repository } from 'typeorm';
import { Batch } from '../batch/entities/batch.entity';
import { Topic } from '../topics/entities/topic.entity';
import { User } from 'src/users/entities/user.entity';
import { Submission } from 'src/submissions/entities/submission.entity';

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

    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
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

    const quizs = await this.quizRepository.find({
      where: { batch: batch },
      relations: ['batch', 'topics', 'createdBy'],
    });

    const submissions = await this.submissionRepository.find({
      where: {
        quiz: {
          quiz_id: In(quizs.map((a) => a.quiz_id)),
        },
      },
      relations: ['quiz'],
    });

    const quizsWithSubmissions = quizs.map((quiz) => {
      const totalSubmissions = submissions.filter(
        (sub) => sub.quiz && sub.quiz.quiz_id === quiz.quiz_id,
      ).length;

      return {
        ...quiz,
        totalSubmissions,
      };
    });
    return quizsWithSubmissions;
  }
  async findOne(quizId: string): Promise<Quiz> {
    if (!quizId) {
      throw new BadRequestException('AssignmentId is required');
    }

    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quizId },
      relations: ['batch', 'topics', 'createdBy'],
    });

    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    const submissions = await this.submissionRepository.find({
      where: { quiz: { quiz_id: quizId } },
    });

    const quizWithSubmissions = {
      ...quiz,
      totalSubmissions: submissions.length,
    };

    return quizWithSubmissions;
  }
  async update(updateQuizInput: UpdateQuizInput): Promise<Quiz> {
    const { quiz_id, topicId, totalmarks, marksBreakDown, Date, title } =
      updateQuizInput;
    if (!quiz_id) {
      throw new BadRequestException('QuizId is required');
    }
    const quiz = await this.quizRepository.findOneBy({ quiz_id: quiz_id });
    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }
    if (!topicId) {
      throw new BadRequestException('TopicId is required');
    }

    const topics = await this.topicRepository.find({
      where: { topic_id: In(topicId) },
    });

    if (topics.length === 0) {
      throw new BadRequestException('One or more TopicIds are invalid');
    }

    quiz.title = title;
    quiz.topics = topics;
    quiz.totalmarks = totalmarks;
    quiz.marksBreakDown = marksBreakDown;
    quiz.Date = Date;
    return await this.quizRepository.save(quiz);
  }

  async remove(quizId: string): Promise<{ quiz_id: string }> {
    if (!quizId) {
      throw new BadRequestException('QuizId is required');
    }
    const quiz = await this.quizRepository.findOneBy({
      quiz_id: quizId,
    });

    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    await this.quizRepository.remove(quiz);
    return { quiz_id: quizId };
  }
}
