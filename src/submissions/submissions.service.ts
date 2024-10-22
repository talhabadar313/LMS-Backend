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
import {
  NotificationType,
  SubmissionStatus,
  SubmissionType,
} from 'src/util/enum';
import { v4 as uuidv4 } from 'uuid';
import { AssignMarsksToQuizInput } from './dto/assign-quizmarks-input';
import { MailService } from 'src/mail/mail.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Batch } from 'src/batch/entities/batch.entity';
import { BatchService } from 'src/batch/batch.service';

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

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    private readonly notificationGateway: NotificationsGateway,
    private readonly mailService: MailService,
    private readonly batchService: BatchService,
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
  async unsubmitSubmission(
    submissionId: string,
  ): Promise<{ submissionid: string }> {
    if (!submissionId) {
      throw new BadRequestException('SubmissionId is required');
    }

    const submission = await this.submissionRepository.findOneBy({
      submissionid: submissionId,
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    if (submission.status === 'Not Assigned' && submission.score === null) {
      await this.submissionRepository.remove(submission);
      return { submissionid: submissionId };
    }

    throw new BadRequestException('Submission cannot be removed');
  }

  update(id: string, updateSubmissionInput: UpdateSubmissionInput) {
    return `This action updates a #${id} submission`;
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

    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const batches = await this.batchService.findStudentBatch(studentId);
    if (!batches || batches.length === 0) {
      throw new BadRequestException('Batch Not Found');
    }

    const batch = batches[0];
    const batchId = batch.batch_id;

    let submission;

    if (submissionId) {
      submission = await this.submissionRepository.findOneBy({
        submissionid: submissionId,
      });
      if (!submission) {
        throw new BadRequestException('Submission not found');
      }
    } else {
      if (!assignmentId) {
        throw new BadRequestException(
          'AssignmentId is required for creating a new submission',
        );
      }

      const assignment = await this.assignmentRepository.findOneBy({
        assignment_id: assignmentId,
      });
      if (!assignment) {
        throw new BadRequestException('Assignment not found');
      }

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
        submissionDate: null,
      });
    }

    submission.status = SubmissionStatus.Assigned;
    submission.checkedAt = new Date();
    submission.checkedBy = user;
    submission.score = score;

    await this.submissionRepository.save(submission);

    // await this.mailService.sendAssignmentMarksNotificationEmail(
    //   student.email,
    //   student.name,
    // );

    await this.notificationGateway.handleNewAssignment({
      title: 'Assignment Marks Assigned',
      description: 'Check Your Classroom',
      type: NotificationType.MARKS,
      batchId,
      studentId,
    });

    return submission;
  }

  async assignMarksToQuiz(assignMarksToQuiz: AssignMarsksToQuizInput) {
    const { submissionId, studentId, checkedBy, score, quizId, SubmittedData } =
      assignMarksToQuiz;

    if (
      !submissionId ||
      !studentId ||
      !checkedBy ||
      !quizId ||
      !SubmittedData
    ) {
      throw new BadRequestException(
        'SubmissionId, StudentId, checkedBy, quizId, and SubmittedData are required',
      );
    }

    const user = await this.userRepository.findOneBy({ user_id: checkedBy });
    if (!user) {
      throw new BadRequestException('CheckedBy user not found');
    }

    const submission = await this.submissionRepository.findOneBy({
      submissionid: submissionId,
      student: { user_id: studentId },
      quiz: { quiz_id: quizId },
    });

    if (!submission) {
      throw new BadRequestException(
        'Submission not found for the provided quiz and student',
      );
    }

    submission.checkedAt = new Date();
    submission.checkedBy = user;
    submission.score = score;
    submission.SubmittedData = SubmittedData?.map((data, index) => ({
      key: (index + 1).toString(),
      name: data.name,
      value: data.value,
    }));

    return await this.submissionRepository.save(submission);
  }
}
