import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { In, IsNull, Repository } from 'typeorm';
import { Batch } from '../batch/entities/batch.entity';
import { Topic } from '../topics/entities/topic.entity';
import { User } from '../users/entities/user.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { MailService } from '../mail/mail.service';
import { BatchService } from '../batch/batch.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../util/enum';

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

    private mailService: MailService,
    private readonly batchService: BatchService,
    private readonly notificationGateway: NotificationsGateway,
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

    await this.quizRepository.save(newQuiz);

    // const users = await this.batchService.GetStudentsByBatchId(batchId);
    // const studentEmails = users?.map((user) => user.email);
    // const studentNames = users?.map((user) => user.name);

    // for (let i = 0; i < studentEmails.length; i++) {
    //   await this.mailService.sendQuizNotificationEmail(
    //     studentEmails[i],
    //     studentNames[i],
    //     title,
    //   );
    // }

    await this.notificationGateway.handleNewAssignment({
      title: 'New Quiz Posted',
      description: 'Check Your Classroom',
      type: NotificationType.QUIZ,
      batchId,
    });

    return newQuiz;
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

  async findUpcomingQuizes(batchId: string): Promise<Quiz[]> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });

    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const quizs = await this.quizRepository.find({
      where: { batch: batch },
      relations: ['batch', 'topics', 'createdBy', 'submissions'],
    });

    const upcomingQuizzes = quizs?.filter((quiz) => {
      const hasNoSubmissions = quiz?.submissions?.length === 0;
      const quizDate = new Date(quiz.Date as string);
      const isTodayOrFutureDate =
        quizDate >= new Date(new Date().setHours(0, 0, 0, 0));

      return hasNoSubmissions && isTodayOrFutureDate;
    });

    return upcomingQuizzes;
  }

  async findQuizsData(batchId: string, studentId: string): Promise<Quiz[]> {
    if (!batchId || !studentId) {
      throw new BadRequestException('BatchId or StudentId is required');
    }

    const batch = await this.batchRepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const quizzes = await this.quizRepository.find({
      where: { batch: batch },
      relations: [
        'batch',
        'topics',
        'createdBy',
        'submissions',
        'submissions.student',
      ],
    });

    const quizzesWithStudentSubmission = quizzes
      .map((quiz) => {
        const submission = quiz.submissions.find(
          (sub) => sub.student?.user_id === studentId,
        );

        if (submission) {
          return {
            ...quiz,
            submissions: [submission],
          };
        }
        return null;
      })
      .filter((quiz) => quiz !== null);

    return quizzesWithStudentSubmission as Quiz[];
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
