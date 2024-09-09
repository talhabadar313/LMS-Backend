import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
@Resolver(() => Candidate)
export class CandidatesResolver {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Mutation(() => Candidate)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin","teacher")
  createCandidate(@Args('createCandidateInput') createCandidateInput: CreateCandidateInput) {
    return this.candidatesService.create(createCandidateInput);
  }

  @Query(() => [Candidate], { name: 'candidates' })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Query(() => [Candidate], { name: 'batchcandidates' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  async findByBatch(@Args('id', { type: () => String }) id: string): Promise<Candidate[]> {
  const candidates = await this.candidatesService.findByBatchId(id);
  
  console.log('Candidates returned from service:', candidates); 
  return candidates;
}


  @Query(() => Candidate, { name: 'candidate' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin","teacher")
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin","teacher")
  @Mutation(() => Candidate)
  updateCandidate(@Args('updateCandidateInput') updateCandidateInput: UpdateCandidateInput) {
    return this.candidatesService.update(updateCandidateInput.candidate_id, updateCandidateInput);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin","teacher")
  @Mutation(() => Candidate)
  removeCandidate(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.remove(id);
  }
}
