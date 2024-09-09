import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/entities/user.entity';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { Candidate } from 'src/candidates/entities/candidate.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Batch, User, Candidate]), AuthModule],
  providers: [BatchResolver, BatchService],
  exports:[TypeOrmModule]
  
})
export class BatchModule {}
