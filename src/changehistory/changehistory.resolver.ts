import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ChangeHistoryService } from './changehistory.service';
import { ChangeHistory } from './entities/changehistory.entity';

@Resolver(() => ChangeHistory)
export class ChangeHistoryResolver {
  constructor(private readonly changeHistoryService: ChangeHistoryService) {}

  @Query(() => [ChangeHistory], { name: 'getChangeHistoryByCandidate' })
  getChangeHistoryByCandidate(@Args('candidateId') candidateId: string) {
    return this.changeHistoryService.getChangeHistoryByCandidateId(candidateId);
  }

  @Mutation(() => ChangeHistory)
  updateCandidateStatus(
    @Args('candidateId') candidateId: string,
    @Args('oldStatus') oldStatus: string,
    @Args('newStatus') newStatus: string,
  ) {
    return this.changeHistoryService.addChangeHistory(
      candidateId,
      newStatus,
      oldStatus,
    );
  }

  @Query(() => [ChangeHistory], { name: 'getClassTimingsChangeHistory' })
  getClassTimingsChangeHistory(@Args('batchId') batchId: string) {
    return this.changeHistoryService.getClassTimingsChangeHistory(batchId);
  }

  @Mutation(() => ChangeHistory, { name: 'changeClassTimings' })
  async updateBatchTimings(
    @Args('batchId') batchId: string,
    @Args('newTimings') newTimings: string,
    @Args('changedBy') changedBy: string,
  ) {
    return this.changeHistoryService.addClassTimingsChangeHistory(
      batchId,
      newTimings,
      changedBy,
    );
  }
}
