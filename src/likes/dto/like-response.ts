import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FindLikesResponse {
  @Field()
  likeCount: number;

  @Field(() => [String])
  userNames: string[];
}
