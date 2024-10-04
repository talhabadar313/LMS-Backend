import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class WatchlistUserInput {
  @Field()
  userId: string;

  @Field()
  warning: string;

  @Field({ nullable: true })
  reason: string;
}
