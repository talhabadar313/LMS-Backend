import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BatchService } from './batch.service';
import { Batch } from './entities/batch.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { ApplicationsResponse } from 'src/candidates/dto/applications-response';

@Resolver(() => Batch)
export class BatchResolver {
  constructor(private readonly batchService: BatchService) {}

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  createBatch(@Args('createBatchInput') createBatchInput: CreateBatchInput) {
    return this.batchService.create(createBatchInput);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  async addTeachersToBatch(
    @Args('batchId') batchId: string,
    @Args('teacherIds', { type: () => [String] }) teacherIds: string[],
  ): Promise<Batch> {
    return this.batchService.addTeachersToBatch(batchId, teacherIds);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  async removeTeacherFromBatch(
    @Args('batchId') batchId: string,
    @Args('teacherId') teacherId: string,
  ): Promise<Batch> {
    return this.batchService.removeTeacherFromBatch(batchId, teacherId);
  }

  @Query(() => [Batch], { name: 'batches' })
  findAll() {
    return this.batchService.findAll();
  }

  @Query(() => Batch, { name: 'batch' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.batchService.findOne(id);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  updateBatch(@Args('updateBatchInput') updateBatchInput: UpdateBatchInput) {
    return this.batchService.update(updateBatchInput.batch_id, updateBatchInput);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  removeBatch(@Args('id', { type: () => String }) id: string) {
    return this.batchService.remove(id);
  }

    @Query(() => ApplicationsResponse)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  getApplicationsPerDay(@Args('id', { type: () => String }) batchId: string) {
    return this.batchService.getApplicationsPerDay(batchId);
  }
}
