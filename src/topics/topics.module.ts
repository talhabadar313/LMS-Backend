import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsResolver } from './topics.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { BatchModule } from '../batch/batch.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), BatchModule, AuthModule],
  providers: [TopicsResolver, TopicsService],
  exports: [TypeOrmModule],
})
export class TopicsModule {}
