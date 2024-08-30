import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BatchService } from './batch.service';
import { Batch } from './entities/batch.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.quard';
import { Roles } from 'src/auth/role.decorator';

@Resolver(() => Batch)
export class BatchResolver {
  constructor(private readonly batchService: BatchService) {}

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  createBatch(@Args('createBatchInput') createBatchInput: CreateBatchInput) {
    return this.batchService.create(createBatchInput);
  }

  @Query(() => [Batch], { name: 'batchs' })
 
  findAll() {
    return this.batchService.findAll();
  }

  @Query(() => Batch, { name: 'batch' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.batchService.findOne(id);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  updateBatch(@Args('updateBatchInput') updateBatchInput: UpdateBatchInput) {
    return this.batchService.update(updateBatchInput.id, updateBatchInput);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  removeBatch(@Args('id', { type: () => String }) id: string) {
    return this.batchService.remove(id);
  }
}
