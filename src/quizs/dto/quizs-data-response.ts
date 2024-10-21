import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UpcomingQuizDto {
  @Field()
  day: string;

  @Field()
  quizTitle: string;

  @Field(() => [String])
  topic: string[];
}

@ObjectType()
export class QuizDataDto {
  @Field(() => ID)
  key: string;

  @Field()
  title: string;

  @Field()
  submittedOn: string;

  @Field()
  totalmarks: number;

  @Field()
  marksobtained: number;

  @Field(() => [String])
  topic: string[];
}

@ObjectType()
export class MarksBreakdownDto {
  @Field()
  BreakdownName: string;

  @Field()
  ObtainedMarks: string;

  @Field()
  TotalMarks: number;
}

@ObjectType()
export class QuizResponseDto {
  @Field(() => [UpcomingQuizDto])
  upcomingQuizData: UpcomingQuizDto[];

  @Field(() => [QuizDataDto])
  quizsData: QuizDataDto[];

  @Field(() => [MarksBreakdownDto])
  marksData: MarksBreakdownDto[];
}
