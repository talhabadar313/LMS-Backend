import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('posts')
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  post_id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  category: string;

  @ManyToOne(() => User, (user) => user.postsCreated)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Field()
  @Column({ type: 'int', default: 0, nullable: true })
  likeCount: number;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  fileType?: string[];

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  fileSrc?: string[];

  @Field()
  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @OneToMany(() => Like, (like) => like.post)
  @Field(() => [Like], { nullable: true })
  likes: Like[];

  @ManyToOne(() => Batch, (batch) => batch.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch, { nullable: true })
  batch: Batch;
}
