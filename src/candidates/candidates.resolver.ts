import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver(() => Candidate)
export class CandidatesResolver {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Mutation(() => Candidate)
  @UseGuards(AuthGuard)

  createCandidate(@Args('createCandidateInput') createCandidateInput: CreateCandidateInput) {
    return this.candidatesService.create(createCandidateInput);
  }

  @Query(() => [Candidate], { name: 'candidates' })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Query(() => [Candidate], { name: 'batchcandidates' })
  @UseGuards(AuthGuard)
  async findByBatch(@Args('id', { type: () => String }) id: string): Promise<Candidate[]> {
  const candidates = await this.candidatesService.findByBatchId(id);
  
  console.log('Candidates returned from service:', candidates); 
  return candidates;
}


  @Query(() => Candidate, { name: 'candidate' })
  @UseGuards(AuthGuard)
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Candidate)
  updateCandidate(@Args('updateCandidateInput') updateCandidateInput: UpdateCandidateInput) {
    return this.candidatesService.update(updateCandidateInput.candidate_id, updateCandidateInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Candidate)
  removeCandidate(@Args('id', { type: () => String }) id: string) {
    return this.candidatesService.remove(id);
  }
}
