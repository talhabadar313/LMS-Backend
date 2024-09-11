import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
@Resolver(() => Candidate)
export class CandidatesResolver {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Mutation(() => Candidate)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin","teacher")
  createCandidate(@Args('createCandidateInput') createCandidateInput: CreateCandidateInput) {
    return this.candidatesService.create(createCandidateInput);
  }

  @Query(() => [Candidate], { name: 'candidates' })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Query(() => [Candidate], { name: 'batchcandidates' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async findByBatch(@Args('id', { type: () => String }) id: string): Promise<Candidate[]> {
  const candidates = await this.candidatesService.findByBatchId(id);
  return candidates;
}


  @Query(() => Candidate, { name: 'candidate' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin","teacher")
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.findOne(id);
  }

  @Query(() => Candidate, { name: 'candidateByEmail' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findOneByEmail(@Args('email', { type: () => String }) email: string) {
    return this.candidatesService.findCandidateByEmail(email);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin","teacher")
  @Mutation(() => Candidate)
  updateCandidate(@Args('updateCandidateInput') updateCandidateInput: UpdateCandidateInput) {
    return this.candidatesService.update(updateCandidateInput.candidate_id, updateCandidateInput);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin","teacher")
  @Mutation(() => Candidate)
  removeCandidate(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.remove(id);
  }
  @Mutation(() => Candidate)

  resetCandidatePassword(
    @Args('email', { type: () => String }) email: string,
    @Args('tempPassword', { type: () => String }) tempPassword: string,
    @Args('newPassword', { type: () => String }) newPassword: string,
  ) {
    return this.candidatesService.resetPassword(email, tempPassword, newPassword);
  }
}
