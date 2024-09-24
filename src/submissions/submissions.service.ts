import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubmissionInput } from './dto/create-submission.input';
import { UpdateSubmissionInput } from './dto/update-submission.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Quiz } from '../quizs/entities/quiz.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,

    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createSubmissionInput: CreateSubmissionInput) {
    const { submissionType, assignmentId, quizId, SubmittedData, studentId } =
      createSubmissionInput;

    const assignment = await this.assignmentRepository.findOneBy({
      assignment_id: assignmentId,
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    const quiz = await this.quizRepository.findOneBy({ quiz_id: quizId });
    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const newSubmission = this.submissionRepository.create({
      submissionType,
      assignment,
      quiz,
      student,
      SubmittedData,
    });

    return await this.submissionRepository.save(newSubmission);
  }

  findAll() {
    return `This action returns all submissions`;
  }

  findOne(id: string) {
    return `This action returns a #${id} submission`;
  }

  update(id: string, updateSubmissionInput: UpdateSubmissionInput) {
    return `This action updates a #${id} submission`;
  }

  remove(id: string) {
    return `This action removes a #${id} submission`;
  }
}
