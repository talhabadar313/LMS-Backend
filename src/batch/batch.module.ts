import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchResolver } from './batch.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([Batch]), AuthModule],
  providers: [BatchResolver, BatchService],
  exports:[TypeOrmModule]
  
})
export class BatchModule {}
