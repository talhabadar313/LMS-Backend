import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/posts/entities/post.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { CommentType } from 'src/util/enum';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Entity()
export class Comment {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  comment_id: String;

  @Field(() => String)
  @Column()
  userName: string;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => Date)
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  commentedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: CommentType,
  })
  commentType: CommentType;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: true })
  @JoinColumn({ name: 'postId' })
  @Field(() => Post)
  post: Post;

  @ManyToOne(() => Assignment, (assignment) => assignment.comments, {
    nullable: true,
  })
  @JoinColumn({ name: 'assignmentId' })
  @Field(() => Assignment, { nullable: true })
  assignment: Assignment;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @Field(() => Comment, { nullable: true })
  parentComment: Comment;

  @ManyToOne(() => User, (user) => user.comments, { nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  @Field(() => [Comment], { nullable: true })
  replies: Comment[];
}
