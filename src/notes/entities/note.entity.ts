import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notes')
@ObjectType()
export class Note {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  note_id: string;

  @Field()
  @Column({ type: String })
  note: string;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => User, (user) => user.notesCreated)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;
}
