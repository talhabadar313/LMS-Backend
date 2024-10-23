import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
  @Field()
  user_id: string;

  @Field()
  oldPassword: string;
  email: string;

  @Field()
  newPassword: string;
}
