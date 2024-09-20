import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { CreateLikeInput } from './dto/create-like.input';
import { CreateLikeResponse } from './dto/create-like-response'; // Ensure this path is correct
import { FindLikesResponse } from './dto/like-response';

@Resolver(() => Like)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @Mutation(() => CreateLikeResponse)
  async createLike(
    @Args('createLikeInput') createLikeInput: CreateLikeInput,
  ): Promise<CreateLikeResponse> {
    return this.likesService.create(createLikeInput);
  }

  @Mutation(() => String)
  removeLike(@Args('id', { type: () => String }) id: string): Promise<string> {
    return this.likesService.remove(id);
  }

  @Query(() => FindLikesResponse, { name: 'likesByPostId' })
  async findLikesByPostId(
    @Args('postId', { type: () => String }) postId: string,
  ): Promise<FindLikesResponse> {
    return this.likesService.findLikesByPostId(postId);
  }
}
