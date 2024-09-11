import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';


@Module({
  imports:[TypeOrmModule.forFeature([Batch, User]), AuthModule],
  providers: [BatchResolver, BatchService],
  exports:[TypeOrmModule]
  
})
export class BatchModule {}
