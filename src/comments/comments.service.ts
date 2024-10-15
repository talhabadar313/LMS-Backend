import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { CommentType } from 'src/util/enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const { assignmentId, postId, userId, parentCommentId, ...rest } =
      createCommentInput;

    let relatedEntity: Post | Assignment | null = null;
    let commentType: CommentType | null = null;

    if (postId) {
      const post = await this.postRepository.findOneBy({ post_id: postId });
      if (!post) {
        throw new BadRequestException('Post Not Found');
      }
      relatedEntity = post;
      commentType = CommentType.POST;
    } else if (assignmentId) {
      const assignment = await this.assignmentRepository.findOneBy({
        assignment_id: assignmentId,
      });
      if (!assignment) {
        throw new BadRequestException('Assignment Not Found');
      }

      const user = await this.userRepository.findOneBy({ user_id: userId });
      if (!user) {
        throw new BadRequestException('User Not Found');
      }

      relatedEntity = assignment;
      commentType = CommentType.ASSIGNMENT;
    } else if (!parentCommentId) {
      throw new BadRequestException(
        'Either postId, assignmentId, or parentCommentId must be provided',
      );
    }

    if (parentCommentId) {
      const parentComment = await this.commentsRepository.findOneBy({
        comment_id: parentCommentId,
      });
      if (!parentComment) {
        throw new BadRequestException('Parent comment not found');
      }

      commentType = parentComment.commentType;
    }

    const comment = this.commentsRepository.create({
      ...rest,
      parentComment: parentCommentId ? { comment_id: parentCommentId } : null,
      ...(postId ? { post: { post_id: postId } } : {}),
      ...(assignmentId ? { assignment: { assignment_id: assignmentId } } : {}),
      commentType: commentType,
      user: userId ? { user_id: userId } : null,
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
      where: { post: { post_id: postId }, parentComment: null },
      relations: ['replies'],
    });

    return comments;
  }

  async findAllCommentsByAssignment(
    assignmentId: string,
    userId: string,
  ): Promise<Comment[]> {
    if (!assignmentId) {
      throw new BadRequestException('Assignment Id is required');
    }
    const assignment = await this.assignmentRepository.findOneBy({
      assignment_id: assignmentId,
    });
    if (!assignment) {
      throw new BadRequestException('Assignment Not Found');
    }
    if (!userId) {
      throw new BadRequestException('User Id is required');
    }
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    const comments = await this.commentsRepository.find({
      where: {
        assignment: { assignment_id: assignmentId },
        user: { user_id: userId },
        parentComment: null,
      },
      relations: ['replies'],
    });

    return comments;
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentsRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Comment with ID ${id} not found`);
    }
  }
}
