import { Field, ObjectType } from '@nestjs/graphql';
import { Batch } from 'src/batch/entities/batch.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationType } from 'src/util/enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Notification {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Batch, (batch) => batch.notifications, { nullable: true })
  @JoinColumn({ name: 'batchId' })
  @Field(() => Batch, { nullable: true })
  batch: Batch;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  @Field(() => User, { nullable: true })
  student: User;
}
