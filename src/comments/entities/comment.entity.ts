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

  @ManyToOne(() => Post, (post) => post.comments, { nullable: true })
  @JoinColumn({ name: 'postId' })
  @Field(() => Post)
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @Field(() => Comment, { nullable: true })
  parentComment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  @Field(() => [Comment], { nullable: true })
  replies: Comment[];
}
