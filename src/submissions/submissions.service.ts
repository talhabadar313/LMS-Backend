import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubmissionInput } from './dto/create-submission.input';
import { UpdateSubmissionInput } from './dto/update-submission.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Quiz } from '../quizs/entities/quiz.entity';
import { User } from '../users/entities/user.entity';
import { AssignMarsksToAssignmentInput } from './dto/assign-assignmentmarks-input';

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

    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    let assignment: Assignment | null = null;
    let quiz: Quiz | null = null;

    if (assignmentId) {
      assignment = await this.assignmentRepository.findOneBy({
        assignment_id: assignmentId,
      });

      if (!assignment) {
        throw new BadRequestException('Assignment not found');
      }
    } else if (quizId) {
      quiz = await this.quizRepository.findOneBy({ quiz_id: quizId });

      if (!quiz) {
        throw new BadRequestException('Quiz not found');
      }
    } else {
      throw new BadRequestException(
        'Either assignmentId or quizId must be provided',
      );
    }
    const processedSubmittedData = SubmittedData?.map((data, index) => ({
      key: (index + 1).toString(),
      name: data.name,
      value: data.value,
    }));

    const newSubmission = this.submissionRepository.create({
      submissionType,
      assignment,
      quiz,
      student,
      SubmittedData: processedSubmittedData,
    });

    return await this.submissionRepository.save(newSubmission);
  }

  async findAll(assignmentId: string): Promise<Submission[]> {
    if (!assignmentId) {
      throw new BadRequestException('AssignmentId is required');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { assignment_id: assignmentId },
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    return await this.submissionRepository.find({
      where: { assignment: { assignment_id: assignmentId } },
      relations: ['assignment', 'quiz', 'student'],
    });
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

  async assignMarksToAssignment(
    assignMarksToAssignmentInput: AssignMarsksToAssignmentInput,
  ) {
    const { submissionId, studentId, status, checkedBy, score } =
      assignMarksToAssignmentInput;

    if (!submissionId || !studentId) {
      throw new BadRequestException('SubmissionId and StudentId are required');
    }

    const submission = await this.submissionRepository.findOneBy({
      submissionid: submissionId,
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    submission.status = status;
    submission.checkedAt = new Date();
    submission.checkedBy = checkedBy;
    submission.score = score;

    return await this.submissionRepository.save(submission);
  }
}
