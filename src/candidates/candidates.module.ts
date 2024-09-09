import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesResolver } from './candidates.resolver';
import { Candidate } from './entities/candidate.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchModule } from '../batch/batch.module';

@Module({
  imports:[TypeOrmModule.forFeature([Candidate]), AuthModule, BatchModule],
  providers: [CandidatesResolver, CandidatesService],
  exports:[TypeOrmModule]
})
export class CandidatesModule {}
