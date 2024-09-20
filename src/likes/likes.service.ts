import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateLikeInput } from './dto/create-like.input';
import { FindLikesResponse } from './dto/like-response';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createLikeInput: CreateLikeInput,
  ): Promise<{ likeCount: number }> {
    const { postId, userId } = createLikeInput;

    const post = await this.postRepository.findOne({
      where: { post_id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        post: { post_id: post.post_id },
        user: { user_id: user.user_id },
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      post.likeCount -= 1;
    } else {
      const like = this.likeRepository.create({ post, user });
      await this.likeRepository.save(like);
      post.likeCount += 1;
    }

    await this.postRepository.save(post);

    return { likeCount: post.likeCount };
  }

  async remove(id: string): Promise<string> {
    const like = await this.likeRepository.findOne({ where: { id } });
    if (!like) {
      throw new NotFoundException(`Like with id ${id} not found.`);
    }
    await this.likeRepository.remove(like);

    return 'Like removed';
  }

  async findLikesByPostId(
    postId: string,
  ): Promise<{ likeCount: number; userNames: string[] }> {
    const likes = await this.likeRepository.find({
      where: { post: { post_id: postId } },
      relations: ['user'],
    });

    const likeCount = likes.length;
    const userNames = likes.map((like) => like.user.name); // Adjust based on your User entity structure

    return { likeCount, userNames };
  }
}
