import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Batch } from '../batch/entities/batch.entity';
import { In, Repository } from 'typeorm';
import { Topic } from '../topics/entities/topic.entity';
import { supabase } from '../supabase.config';
import { Submission } from 'src/submissions/entities/submission.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Batch)
    private readonly batchrepository: Repository<Batch>,

    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}
  async create(
    createAssignmentInput: CreateAssignmentInput,
  ): Promise<Assignment> {
    const {
      title,
      createdBy,
      dueDate,
      totalmarks,
      description,
      batchId,
      topicId,
      files,
    } = createAssignmentInput;

    console.log('Files received:', files);

    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchrepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    let attachmentSrc: string[] = [];
    let attachmentType: string[] = [];

    if (files && files.length > 0) {
      console.log('Processing multiple file uploads...');

      for (const filePromise of files) {
        try {
          const resolvedFile = await filePromise;
          const { createReadStream, mimetype, filename } = resolvedFile;

          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
          ];
          if (!allowedMimeTypes.includes(mimetype)) {
            throw new BadRequestException('Invalid file type.');
          }

          const stream = createReadStream();
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          const { data, error } = await supabase.storage
            .from('LMS Bucket')
            .upload(`posts/${filename}`, buffer, { contentType: mimetype });

          if (error) {
            throw new Error(`File upload error: ${error.message}`);
          }

          const fileUrl = data?.path
            ? `${supabase.storage.from('LMS Bucket').getPublicUrl(data.path).data.publicUrl}`
            : null;

          attachmentSrc.push(fileUrl);
          attachmentType.push(mimetype);

          console.log('File uploaded successfully. URL:', fileUrl);
        } catch (err) {
          console.error('Supabase upload error:', err);
          throw new Error(`File upload error: ${err.message}`);
        }
      }
    }
    const user = await this.userRepository.findOneBy({ user_id: createdBy });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const assignment = this.assignmentRepository.create({
      title,
      createdBy: user,
      description,
      dueDate,
      totalmarks,
      attachmentSrc,
      attachmentType,
      batch,
    });

    if (!topicId || topicId.length == 0) {
      throw new BadRequestException('At least one TopicId is required');
    }

    const topics = await this.topicRepository.find({
      where: { topic_id: In(topicId) },
    });

    if (topics.length === 0) {
      throw new BadRequestException('One or more TopicIds are invalid');
    }

    assignment.topics = topics;

    await this.assignmentRepository.save(assignment);

    return assignment;
  }

  async findAll(batchId: string): Promise<Assignment[]> {
    if (!batchId) {
      throw new BadRequestException('BatchId is required');
    }

    const batch = await this.batchrepository.findOneBy({ batch_id: batchId });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }

    const assignments = await this.assignmentRepository.find({
      where: { batch: batch },
      relations: ['batch', 'topics', 'createdBy'],
    });

    const submissions = await this.submissionRepository.find({
      where: {
        assignment: {
          assignment_id: In(assignments.map((a) => a.assignment_id)),
        },
      },
      relations: ['assignment'],
    });

    console.log('Assignments:', assignments);
    console.log('Submissions with Assignment Details:', submissions);

    const assignmentsWithSubmissions = assignments.map((assignment) => {
      const totalSubmissions = submissions.filter(
        (sub) =>
          sub.assignment &&
          sub.assignment.assignment_id === assignment.assignment_id,
      ).length;

      console.log(
        `Assignment ID: ${assignment.assignment_id}, Total Submissions: ${totalSubmissions}`,
      );

      return {
        ...assignment,
        totalSubmissions,
      };
    });

    return assignmentsWithSubmissions;
  }

  async findOne(assignmentId: string): Promise<Assignment> {
    if (!assignmentId) {
      throw new BadRequestException('AssignmentId is required');
    }

    const assignments = await this.assignmentRepository.findOne({
      where: { assignment_id: assignmentId },
      relations: ['batch', 'topics', 'createdBy'],
    });

    if (!assignments) {
      throw new BadRequestException('Assignment not found');
    }

    const submissions = await this.submissionRepository.find({
      where: { assignment: { assignment_id: assignmentId } },
    });

    const assignmentsWithSubmissions = {
      ...assignments,
      totalSubmissions: submissions.length,
    };

    return assignmentsWithSubmissions;
  }
}
