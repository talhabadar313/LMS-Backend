import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BatchService } from './batch.service';
import { Batch } from './entities/batch.entity';
import { CreateBatchInput } from './dto/create-batch.input';
import { UpdateBatchInput } from './dto/update-batch.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { ApplicationsResponse } from '../candidates/dto/applications-response';
import { User } from 'src/users/entities/user.entity';
import { StudentResponse } from './dto/students-response';
import { UpdateExistingBatchInput } from './dto/update-existingbatch-input';

@Resolver(() => Batch)
export class BatchResolver {
  constructor(private readonly batchService: BatchService) {}

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  createBatch(@Args('createBatchInput') createBatchInput: CreateBatchInput) {
    return this.batchService.create(createBatchInput);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async addTeachersToBatch(
    @Args('batchId') batchId: string,
    @Args('teacherIds', { type: () => [String] }) teacherIds: string[],
  ): Promise<Batch> {
    return this.batchService.addTeachersToBatch(batchId, teacherIds);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async removeTeacherFromBatch(
    @Args('batchId') batchId: string,
    @Args('teacherId') teacherId: string,
  ): Promise<Batch> {
    return this.batchService.removeTeacherFromBatch(batchId, teacherId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Query(() => [Batch], { name: 'batches' })
  findAll() {
    return this.batchService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Query(() => Batch, { name: 'batch' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.batchService.findOne(id);
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  updateBatch(@Args('updateBatchInput') updateBatchInput: UpdateBatchInput) {
    return this.batchService.update(
      updateBatchInput.batch_id,
      updateBatchInput,
    );
  }

  @Mutation(() => Batch)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  removeBatch(@Args('id', { type: () => String }) id: string) {
    return this.batchService.remove(id);
  }

  @Query(() => ApplicationsResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  getApplicationsPerDay(@Args('id', { type: () => String }) batchId: string) {
    return this.batchService.getApplicationsPerDay(batchId);
  }

  @Query(() => Batch, { name: 'getStudentsByBatch' })
  findStudentsByBatchId(
    @Args('batchId', { type: () => String }) batchId: string,
  ) {
    return this.batchService.findStudentsByBatchId(batchId);
  }

  @Query(() => [StudentResponse], { name: 'getStudentsDetailsByBatch' })
  findStudentsDetailsByBatchId(
    @Args('batchId', { type: () => String }) batchId: string,
    offset: number,
  ) {
    return this.batchService.findStudentsDetailsByBatchId(batchId);
  }

  @Mutation(() => Batch, { name: 'updateClassTimings' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  updateClassTimings(
    @Args('batchId') batchId: string,
    @Args('newTimings') newTimings: string,
    @Args('changedBy') changedBy: string,
  ) {
    return this.batchService.updateClassTimings(batchId, newTimings, changedBy);
  }

  @Mutation(() => Batch, { name: 'updateExistingBatch' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  updateExistingBatch(
    @Args('UpdateExistingBatchInput')
    updateExistingBatchInput: UpdateExistingBatchInput,
  ) {
    return this.batchService.updateExistingBatch(updateExistingBatchInput);
  }
}
