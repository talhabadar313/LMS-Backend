import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TopicsService } from './topics.service';
import { Topic } from './entities/topic.entity';
import { CreateTopicInput } from './dto/create-topic.input';
import { UpdateTopicInput } from './dto/update-topic.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';

@Resolver(() => Topic)
export class TopicsResolver {
  constructor(private readonly topicsService: TopicsService) {}

  @Mutation(() => Topic, { name: 'createTopic' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  createTopic(@Args('createTopicInput') createTopicInput: CreateTopicInput) {
    return this.topicsService.create(createTopicInput);
  }

  @Query(() => [Topic], { name: 'getAllTopicsByBatch' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findAll(@Args('batchId', { type: () => String }) batchId: string) {
    return this.topicsService.findAll(batchId);
  }

  @Mutation(() => Topic, { name: 'updateTopic' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  updateTopic(@Args('updateTopicInput') updateTopicInput: UpdateTopicInput) {
    return this.topicsService.update(
      updateTopicInput.topic_id,
      updateTopicInput,
    );
  }

  @Mutation(() => Topic, { name: 'removeTopic' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  removeTopic(@Args('id', { type: () => String }) id: string) {
    return this.topicsService.remove(id);
  }
}
