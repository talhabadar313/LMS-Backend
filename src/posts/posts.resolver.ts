import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { PostService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UseGuards } from '@nestjs/common';
@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
  ): Promise<Post> {
    return this.postService.createPost(createPostInput);
  }

  @Query(() => [Post], { name: 'getPostsByBatchId' })
  async postsByBatchId(@Args('batchId') batchId: string): Promise<Post[]> {
    console.log('Received batchId:', batchId);
    return this.postService.getPostsByBatchId(batchId);
  }
}
