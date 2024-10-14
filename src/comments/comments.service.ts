import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const { postId, parentCommentId, ...rest } = createCommentInput;

    if (postId) {
      const post = await this.postRepository.findOneBy({ post_id: postId });
      if (!post) {
        throw new BadRequestException('Post Not Found');
      }
    }
    const comment = this.commentsRepository.create({
      ...rest,
      parentComment: parentCommentId ? { comment_id: parentCommentId } : null,
      post: postId ? { post_id: postId } : null,
    });
    return await this.commentsRepository.save(comment);
  }

  async findAll(postId: string): Promise<Comment[]> {
    if (!postId) {
      throw new BadRequestException('Post Id is required');
    }

    const post = await this.postRepository.findOneBy({ post_id: postId });

    if (!post) {
      throw new BadRequestException('Post Not Found');
    }

    const comments = await this.commentsRepository.find({
      where: { post: { post_id: postId } },
      relations: ['parentComment', 'replies'],
    });

    const result: Comment[] = [];

    const commentMap = new Map<string, Comment>();

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(String(comment.comment_id), comment);
    });

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parentComment = commentMap.get(
          String(comment.parentComment.comment_id),
        );
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      } else {
        result.push(comment);
      }
    });

    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentsRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Comment with ID ${id} not found`);
    }
  }
}
