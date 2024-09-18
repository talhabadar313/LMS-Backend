import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field(() => ID)
  post_id: string;

  @Field()
  @IsString()
  catgeory: string;

  @Field()
  @IsString()
  createdBy: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  createdOn: Date;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  likeCount: number;

  @Field({ nullable: true })
  @IsString()
  fileType: string;

  @Field({ nullable: true })
  @IsString()
  fileSrc: string;

  @Field({ defaultValue: false, nullable: true })
  @IsBoolean()
  deleted: boolean;
}
