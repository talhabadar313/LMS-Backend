import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Mutation(() => Assignment, { name: 'createAssignment' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
  ) {
    return this.assignmentsService.create(createAssignmentInput);
  }

  @Query(() => [Assignment], { name: 'getAllAssignmentsByBatch' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findAll(@Args('batchId', { type: () => String }) batchId: string) {
    return this.assignmentsService.findAll(batchId);
  }

  // @Query(() => Assignment, { name: 'getOneAssignment' })
  // @Mutation(() => Assignment, { name: 'createAssignment' })
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin', 'teacher')
  // findOne(@Args('id', { type: () => String }) id: string) {
  //   return this.assignmentsService.findOne(id);
  // }

  // @Mutation(() => Assignment, { name: 'updateAssignment' })
  // @Mutation(() => Assignment, { name: 'createAssignment' })
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin', 'teacher')
  // updateAssignment(
  //   @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
  // ) {
  //   return this.assignmentsService.update(
  //     updateAssignmentInput.assignment_id,
  //     updateAssignmentInput,
  //   );
  // }

  // @Mutation(() => Assignment, { name: 'removeAssignment' })
  // @Mutation(() => Assignment, { name: 'createAssignment' })
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin', 'teacher')
  // removeAssignment(@Args('id', { type: () => String }) id: string) {
  //   return this.assignmentsService.remove(id);
  // }
}
