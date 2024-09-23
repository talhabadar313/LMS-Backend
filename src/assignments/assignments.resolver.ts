import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Mutation(() => Assignment, { name: 'createAssignment' })
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
  ) {
    return this.assignmentsService.create(createAssignmentInput);
  }

  @Query(() => [Assignment], { name: 'getAllAssignments' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Query(() => Assignment, { name: 'getOneAssignment' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Mutation(() => Assignment, { name: 'updateAssignment' })
  updateAssignment(
    @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
  ) {
    return this.assignmentsService.update(
      updateAssignmentInput.assignment_id,
      updateAssignmentInput,
    );
  }

  @Mutation(() => Assignment, { name: 'removeAssignment' })
  removeAssignment(@Args('id', { type: () => String }) id: string) {
    return this.assignmentsService.remove(id);
  }
}
