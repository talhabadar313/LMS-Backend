import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { AuthModule } from '../auth/auth.module'; 
import { BatchModule } from '../batch/batch.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { Candidate } from '../candidates/entities/candidate.entity';
@Module({
  imports: [
    forwardRef(() => AuthModule), 
    BatchModule,
    CandidatesModule,
    TypeOrmModule.forFeature([User, Candidate]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
