import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { QuizsService } from './quizs.service';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';

@Resolver(() => Quiz)
export class QuizsResolver {
  constructor(private readonly quizsService: QuizsService) {}

  @Mutation(() => Quiz, { name: 'createQuiz' })
  createQuiz(@Args('createQuizInput') createQuizInput: CreateQuizInput) {
    return this.quizsService.create(createQuizInput);
  }

  @Query(() => [Quiz], { name: 'getAllQuizesByBatch' })
  findAll(@Args('batchId', { type: () => String }) batchId: string) {
    return this.quizsService.findAll(batchId);
  }

  @Mutation(() => Quiz, { name: 'updateQuiz' })
  updateQuiz(@Args('updateQuizInput') updateQuizInput: UpdateQuizInput) {
    return this.quizsService.update(updateQuizInput.quiz_id, updateQuizInput);
  }

  @Mutation(() => Quiz, { name: 'removeQuiz' })
  removeQuiz(@Args('id', { type: () => String }) id: string) {
    return this.quizsService.remove(id);
  }
}