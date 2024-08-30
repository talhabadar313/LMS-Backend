import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { AuthModule } from '../auth/auth.module'; 
import { BatchModule } from 'src/batch/batch.module';
import { CandidatesModule } from 'src/candidates/candidates.module';
@Module({
  imports: [
    forwardRef(() => AuthModule), 
    BatchModule,
    CandidatesModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
