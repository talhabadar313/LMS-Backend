import { registerEnumType } from '@nestjs/graphql';

export enum SubmissionType {
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
}
export enum SubmissionStatus {
  Assigned = 'Assigned',
  NotAssigned = 'Not Assigned',
}

registerEnumType(SubmissionType, {
  name: 'SubmissionType',
  description: 'The type of submission (assignment or quiz)',
});
registerEnumType(SubmissionStatus, {
  name: 'SubmissionStatus',
  description: 'The type of status (assigned or not assigned)',
});
