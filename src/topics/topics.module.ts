import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsResolver } from './topics.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { BatchModule } from 'src/batch/batch.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), BatchModule, AuthModule],
  providers: [TopicsResolver, TopicsService],
})
export class TopicsModule {}
