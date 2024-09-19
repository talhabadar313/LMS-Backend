import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Field()
  @Column()
  createdBy: string;

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
  fileType?: string[]; // Array of file types

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  fileSrc?: string[]; // Array of file URLs

  @Field()
  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Batch, (batch) => batch.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch, { nullable: true })
  batch: Batch;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user: User;
}
