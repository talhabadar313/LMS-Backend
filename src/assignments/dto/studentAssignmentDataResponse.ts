import { ObjectType, Field } from '@nestjs/graphql';
import { AssignmentSubmissionStatusType } from 'src/util/enum';

@ObjectType()
export class AssignmentResponseDto {
  @Field()
  assignment_id: string;

  @Field()
  title: string;

  @Field()
  totalmarks: number;

  @Field()
  description: string;

  @Field()
  dueDate: Date;

  @Field(() => [String], { nullable: true })
  attachmentType?: string[];

  @Field(() => [String], { nullable: true })
  attachmentSrc?: string[];

  @Field(() => UserDto)
  createdBy: UserDto;

  @Field(() => [SubmissionDto])
  submissions: SubmissionDto[];

  @Field(() => [CommentDto])
  comments: CommentDto[];

  @Field()
  submissionStatus: AssignmentSubmissionStatusType;
}

@ObjectType()
class UserDto {
  @Field()
  user_id: string;

  @Field()
  username: string;
}

@ObjectType()
class SubmissionDto {
  @Field({ nullable: true })
  submissionDate: Date | null;

  @Field({ nullable: true })
  score: number | null;

  @Field({ nullable: true })
  SubmittedData: any;

  @Field(() => UserDto)
  student: UserDto;
}

@ObjectType()
class CommentDto {
  @Field()
  commentId: string;

  @Field(() => String)
  userName: string;

  @Field()
  content: string;

  @Field(() => UserDto) // Nested user object
  user: UserDto;
}
