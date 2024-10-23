import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  user_id: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  address: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
