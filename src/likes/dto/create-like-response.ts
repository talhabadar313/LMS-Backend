import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateLikeResponse {
  @Field()
  likeCount: number;
}
