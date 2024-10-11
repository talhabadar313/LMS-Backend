import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(title: string, description: string) {
    const notification = this.notificationRepository.create({
      title,
      description,
      createdAt: new Date(),
    });
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }
}
