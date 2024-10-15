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

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

registerEnumType(AttendanceStatus, {
  name: 'AttendanceStatus',
  description: 'The type of status (present or absent)',
});

export enum NotificationType {
  ASSIGNMENT = 'Assignment',
  QUIZ = 'Quiz',
  MARKS = 'Marks',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'The type of notification (assignment , quiz or marks)',
});

export enum CommentType {
  POST = 'Post',
  ASSIGNMENT = 'Assignment',
}

registerEnumType(CommentType, {
  name: 'CommentType',
  description: 'The type of comment (post or assignment)',
});
