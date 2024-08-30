import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.quard';
import { Roles } from 'src/auth/role.decorator';
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

  @Query(() => Candidate, { name: 'candidate' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.findOne(id);
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
}
