import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Batch } from '../batch/entities/batch.entity';
import { In, Repository } from 'typeorm';
import { Topic } from '../topics/entities/topic.entity';
import { supabase } from '../supabase.config';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(Batch)
    private readonly batchrepository: Repository<Batch>,

    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
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

    const assignment = this.assignmentRepository.create({
      title,
      createdBy,
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
    return await this.assignmentRepository.find({
      where: { batch: batch },
      relations: ['batch', 'topics'],
    });
  }
}
