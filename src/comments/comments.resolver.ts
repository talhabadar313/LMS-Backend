import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    return this.commentsService.create(createCommentInput);
  }

  @Query(() => [Comment], { name: 'getCommentsByPost' })
  findAllCommentsByPost(
    @Args('postId', { type: () => String }) postId: string,
  ) {
    return this.commentsService.findAll(postId);
  }

  @Mutation(() => Boolean)
  async removeComment(@Args('id', { type: () => String }) id: string) {
    await this.commentsService.remove(id);
    return true;
  }
}
