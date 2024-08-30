import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Boolean , { nullable: true })
  watchlisted: boolean;

  @Field(() => String, { nullable: true })
  batchId?: string;

  @Field(() => String, { nullable: true })
  candidateId?: string;
}
