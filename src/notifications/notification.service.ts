import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from 'src/util/enum';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    title: string,
    description: string,
    type: NotificationType,
    batchId?: string,
    studentId?: string,
  ) {
    let batch = null;
    let student = null;

    if (batchId) {
      batch = await this.batchRepository.findOneBy({ batch_id: batchId });
      if (!batch) {
        throw new Error('Batch not found');
      }
    }
    if (studentId) {
      student = await this.userRepository.findOneBy({ user_id: studentId });
      if (!student) {
        throw new Error('Student not found');
      }
    }

    const notification = this.notificationRepository.create({
      title,
      description,
      createdAt: new Date(),
      type,
      batch,
      student,
    });

    return await this.notificationRepository.save(notification);
  }

  async findByBatchAndStudentId(
    batchId: string,
    studentId: string,
  ): Promise<Notification[]> {
    console.log('Fetching notifications for:', { batchId, studentId });

    const notifications = await this.notificationRepository.find({
      where: [
        { batch: { batch_id: batchId }, student: { user_id: studentId } },
        { batch: { batch_id: batchId }, student: null },
      ],
      relations: ['student'],
    });

    console.log('Fetched Notifications:', notifications);
    return notifications;
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }
}
