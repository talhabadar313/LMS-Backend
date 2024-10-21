import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UpdateAssignmentInput } from './dto/update-assignment.input';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}
  @Query(() => [Assignment], { name: 'getAllAssignmentsByBatch' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findAll(@Args('batchId', { type: () => String }) batchId: string) {
    return this.assignmentsService.findAll(batchId);
  }

  @Query(() => Assignment, { name: 'getOneAssignment' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findOne(@Args('assignmentId', { type: () => String }) assignmentId: string) {
    return this.assignmentsService.findOne(assignmentId);
  }

  @Query(() => [Assignment], { name: 'getUpcomingAssignmentsForStudent' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  findUpcomingAssignments(
    @Args('batchId', { type: () => String }) batchId: string,
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.assignmentsService.findUpcomingAssignments(batchId, studentId);
  }

  @Query(() => [Assignment], { name: 'getAssignmentsDataForStudent' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  findAssignmentsData(
    @Args('batchId', { type: () => String }) batchId: string,
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.assignmentsService.findAssignmentsData(batchId, studentId);
  }

  @Mutation(() => Assignment, { name: 'createAssignment' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
  ) {
    return this.assignmentsService.create(createAssignmentInput);
  }

  @Mutation(() => Assignment, { name: 'updateAssignment' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  updateAssignment(
    @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
  ) {
    return this.assignmentsService.updateAssignment(updateAssignmentInput);
  }

  @Mutation(() => Assignment, { name: 'removeAssignment' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  removeAssignment(
    @Args('assignmentId', { type: () => String }) assignmentId: string,
  ) {
    return this.assignmentsService.remove(assignmentId);
  }
}
