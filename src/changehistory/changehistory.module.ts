import { forwardRef, Module } from '@nestjs/common';
import { ChangeHistoryService } from './changehistory.service';
import { ChangeHistoryResolver } from './changehistory.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeHistory } from './entities/changehistory.entity';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports:[TypeOrmModule.forFeature([ChangeHistory]), forwardRef(() => CandidatesModule),],
  providers: [ChangeHistoryResolver, ChangeHistoryService],
  exports:[ChangeHistoryService]
})
export class ChangehistoryModule {}
