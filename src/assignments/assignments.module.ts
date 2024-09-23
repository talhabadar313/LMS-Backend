import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { BatchModule } from '../batch/batch.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment]), BatchModule, TopicsModule],
  providers: [AssignmentsResolver, AssignmentsService],
})
export class AssignmentsModule {}
