import { forwardRef, Module } from '@nestjs/common';
import { ChangeHistoryService } from './changehistory.service';
import { ChangeHistoryResolver } from './changehistory.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeHistory } from './entities/changehistory.entity';
import { CandidatesModule } from '../candidates/candidates.module';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import { Candidate } from 'src/candidates/entities/candidate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChangeHistory, Batch, User, Candidate]),
    forwardRef(() => CandidatesModule),
  ],
  providers: [ChangeHistoryResolver, ChangeHistoryService],
  exports: [ChangeHistoryService],
})
export class ChangehistoryModule {}
