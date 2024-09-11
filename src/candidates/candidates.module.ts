import { forwardRef, Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesResolver } from './candidates.resolver';
import { Candidate } from './entities/candidate.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Candidate, Batch, User]),  forwardRef(() => AuthModule), MailModule],
  providers: [CandidatesResolver, CandidatesService],
  exports:[ CandidatesService]
})
export class CandidatesModule {}
