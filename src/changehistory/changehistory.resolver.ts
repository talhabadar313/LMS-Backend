import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ChangeHistoryService } from './changehistory.service';
import { CandidatesService } from '../candidates/candidates.service';
import { ChangeHistory } from './entities/changehistory.entity';

@Resolver(() => ChangeHistory)
export class ChangeHistoryResolver {
  constructor(
    private readonly changeHistoryService: ChangeHistoryService,
    private readonly candidateService: CandidatesService
  ) {}

  @Query(() => [ChangeHistory], { name: 'getChangeHistoryByCandidate' })
  async getChangeHistoryByCandidate(@Args('candidateId') candidateId: string) {
    return this.changeHistoryService.getChangeHistoryByCandidateId(candidateId);
  }

  @Mutation(() => ChangeHistory)
  async updateCandidateStatus(
    @Args('candidateId') candidateId: string,
    @Args('newStatus') newStatus: string
  ) {
    const candidate = await this.candidateService.findOne(candidateId);
    const oldStatus = candidate.status;

    candidate.status = newStatus;
    await this.candidateService.save(candidate);

    return this.changeHistoryService.addChangeHistory(candidate, oldStatus, newStatus);
  }
}
