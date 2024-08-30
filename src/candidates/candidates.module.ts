import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesResolver } from './candidates.resolver';
import { Candidate } from './entities/candidate.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Candidate]), AuthModule],
  providers: [CandidatesResolver, CandidatesService],
  exports:[TypeOrmModule]
})
export class CandidatesModule {}
