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
import { SubmissionStatus, SubmissionType } from 'src/util/enum';
import { v4 as uuidv4 } from 'uuid';

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
    const {
      assignmentId,
      quizId,
      SubmittedData,
      studentId,
      score,
      checkedAt,
      checkedBy,
    } = createSubmissionInput;

    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    let assignment: Assignment | null = null;
    let quiz: Quiz | null = null;
    let submissionStatus: SubmissionStatus;
    let determinedSubmissionType: SubmissionType;

    if (assignmentId) {
      assignment = await this.assignmentRepository.findOneBy({
        assignment_id: assignmentId,
      });

      if (!assignment) {
        throw new BadRequestException('Assignment not found');
      }

      const existingSubmission = await this.submissionRepository.findOne({
        where: {
          assignment: { assignment_id: assignmentId },
          student: { user_id: studentId },
        },
      });
      if (existingSubmission) {
        throw new BadRequestException(
          'Student has already submitted for this assignment',
        );
      }

      determinedSubmissionType = SubmissionType.ASSIGNMENT;
      submissionStatus = SubmissionStatus.NotAssigned;
    } else if (quizId) {
      quiz = await this.quizRepository.findOneBy({ quiz_id: quizId });

      if (!quiz) {
        throw new BadRequestException('Quiz not found');
      }

      const existingSubmission = await this.submissionRepository.findOne({
        where: {
          quiz: { quiz_id: quizId },
          student: { user_id: studentId },
        },
      });
      if (existingSubmission) {
        throw new BadRequestException(
          'Student has already submitted for this quiz',
        );
      }

      determinedSubmissionType = SubmissionType.QUIZ;
      submissionStatus = SubmissionStatus.Assigned;
    } else {
      throw new BadRequestException(
        'Either assignmentId or quizId must be provided',
      );
    }

    const user = await this.userRepository.findOneBy({ user_id: checkedBy });
    if (!user) {
      throw new BadRequestException('Checked by user not found');
    }

    const processedSubmittedData = SubmittedData?.map((data, index) => ({
      key: (index + 1).toString(),
      name: data.name,
      value: data.value,
    }));

    const newSubmission = this.submissionRepository.create({
      assignment,
      quiz,
      student,
      score,
      checkedBy: user,
      checkedAt: checkedAt,
      submissionType: determinedSubmissionType,
      status: submissionStatus,
      SubmittedData: processedSubmittedData,
    });
    return await this.submissionRepository.save(newSubmission);
  }

  async findAllAssignmentSubmissions(
    assignmentId: string,
  ): Promise<Submission[]> {
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
      relations: ['assignment', 'quiz', 'student', 'checkedBy'],
    });
  }

  async findAllQuizSubmissions(quizId: string): Promise<Submission[]> {
    if (!quizId) {
      throw new BadRequestException('QuizId is required');
    }

    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quizId },
    });

    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    return await this.submissionRepository.find({
      where: { quiz: { quiz_id: quizId } },
      relations: ['assignment', 'quiz', 'student', 'checkedBy'],
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
    const { submissionId, studentId, checkedBy, score, assignmentId } =
      assignMarksToAssignmentInput;

    if (!studentId || !checkedBy || score === undefined || score === null) {
      throw new BadRequestException(
        'StudentId, checkedBy, and score are required',
      );
    }

    const user = await this.userRepository.findOneBy({ user_id: checkedBy });
    if (!user) {
      throw new BadRequestException('CheckedBy user not found');
    }

    let submission;

    if (submissionId) {
      submission = await this.submissionRepository.findOneBy({
        submissionid: submissionId,
      });

      if (!submission) {
        throw new BadRequestException('Submission not found');
      }

      // Do not change the submissionDate if submission exists
    } else {
      // Handle the case for missing submissions
      if (!assignmentId) {
        throw new BadRequestException(
          'AssignmentId is required for missing students',
        );
      }

      const assignment = await this.assignmentRepository.findOneBy({
        assignment_id: assignmentId,
      });

      if (!assignment) {
        throw new BadRequestException('Assignment not found');
      }

      // Generate a new submissionId
      const generatedSubmissionId = uuidv4();
      submission = this.submissionRepository.create({
        submissionid: generatedSubmissionId,
        student: { user_id: studentId },
        assignment: assignment,
        submissionType: SubmissionType.ASSIGNMENT,
        status: SubmissionStatus.Assigned,
        checkedAt: new Date(),
        checkedBy: user,
        score: score,
        submissionDate: null, // Ensure submissionDate is null for missing students
      });
    }

    // Update submission properties regardless of whether it's new or existing
    submission.status = SubmissionStatus.Assigned;
    submission.checkedAt = new Date();
    submission.checkedBy = user;
    submission.score = score;

    return await this.submissionRepository.save(submission);
  }
}
