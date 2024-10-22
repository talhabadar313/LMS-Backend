import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionInput } from './dto/create-submission.input';
import { UpdateSubmissionInput } from './dto/update-submission.input';
import { AssignMarsksToAssignmentInput } from './dto/assign-assignmentmarks-input';
import { AssignMarsksToQuizInput } from './dto/assign-quizmarks-input';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Mutation(() => Submission)
  createSubmission(
    @Args('createSubmissionInput') createSubmissionInput: CreateSubmissionInput,
  ) {
    return this.submissionsService.create(createSubmissionInput);
  }

  @Query(() => [Submission], { name: 'getAllSubmissionsByAssignment' })
  findAllSubmissionsOfAssignment(
    @Args('assignmentId', { type: () => String }) assignmentId: string,
  ) {
    return this.submissionsService.findAllAssignmentSubmissions(assignmentId);
  }

  @Query(() => [Submission], { name: 'getAllSubmissionsByQuiz' })
  findAllSubmissionsOfQuiz(
    @Args('quizId', { type: () => String }) assignmentId: string,
  ) {
    return this.submissionsService.findAllQuizSubmissions(assignmentId);
  }
  @Query(() => Submission, { name: 'submission' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.submissionsService.findOne(id);
  }

  @Mutation(() => Submission)
  updateSubmission(
    @Args('updateSubmissionInput') updateSubmissionInput: UpdateSubmissionInput,
  ) {
    return this.submissionsService.update(
      updateSubmissionInput.submissionId,
      updateSubmissionInput,
    );
  }

  @Mutation(() => Submission, { name: 'unsubmitSubmission' })
  unsubmitSubmission(
    @Args('submissionId', { type: () => String }) submissionId: string,
  ) {
    return this.submissionsService.unsubmitSubmission(submissionId);
  }

  @Mutation(() => Submission, { name: 'assignMarksToAssignment' })
  assignMarksToAssignment(
    @Args('assignMarsksToAssignmentInput')
    assignMarsksToAssignmentInput: AssignMarsksToAssignmentInput,
  ) {
    return this.submissionsService.assignMarksToAssignment(
      assignMarsksToAssignmentInput,
    );
  }
  @Mutation(() => Submission, { name: 'assignMarksToQuiz' })
  assignMarksToQuiz(
    @Args('assignMarsksToQuizInput')
    assignMarsksToQuizInput: AssignMarsksToQuizInput,
  ) {
    return this.submissionsService.assignMarksToQuiz(assignMarsksToQuizInput);
  }
}
