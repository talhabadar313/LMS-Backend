import { forwardRef, Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { BatchModule } from '../batch/batch.module';
import { TopicsModule } from '../topics/topics.module';
import { AuthModule } from '../auth/auth.module';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    BatchModule,
    TopicsModule,
    AuthModule,
    forwardRef(() => SubmissionsModule),
  ],
  providers: [AssignmentsResolver, AssignmentsService],
  exports: [TypeOrmModule],
})
export class AssignmentsModule {}
