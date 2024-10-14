import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly invitationTemplate: string;
  private readonly rejectionTemplate: string;
  private readonly resetPasswordTemplate: string;
  private readonly assignmentTemplate: string;
  private readonly quizTemplate: string;
  private readonly assignmentMarksTemplate: string;

  constructor(private readonly mailerService: MailerService) {
    this.invitationTemplate = `
      <h4>Dear {{name}},</h4>
       <p>We hope this message finds you well.</p>
      <p>You have been invited to join our course. Below are your login details:</p>
      <ul>
        <li><strong>Email:</strong> {{email}}</li>
        <li><strong>Temporary Password:</strong> {{tempPassword}}</li>
      </ul>
      <p>Please login and reset your password by clicking the link below:</p>
      <a href="{{loginUrl}}">Login and Reset Password</a>
      <p>Best regards,</p>
      <p><strong>Inciter Tech</strong></p>
    `;

    this.rejectionTemplate = `
      <h4>Dear {{name}},</h4>
      <p>We hope this message finds you well.</p>
      <p>Thank you for your interest in our course. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
      <p>We appreciate the effort you put into applying, and we encourage you to apply again for future opportunities.</p>
      <p>If you have any questions, feel free to reach out.</p>
      <p>Best regards,</p>
      <p><strong>Inciter Tech</strong></p>
    `;

    this.resetPasswordTemplate = `
    <h4>Dear {{name}},</h4>
    <p>Your new password is <strong>{{tempPassword}}</strong></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    <p><strong>Inciter Tech</strong></p>
  `;
    this.assignmentTemplate = `
    <h4>Dear {{name}},</h4>
    <p>A new assignment has been created by your teacher.</p>
    <p>Please log in to your portal to view the assignment details and any deadlines.</p>
    <p>If you have any questions regarding the assignment, please feel free to reach out to your teacher.</p>
    <p>Best regards,</p>
    <p><strong>Inciter Tech</strong></p>
  `;

    this.quizTemplate = `
    <h4>Dear {{name}},</h4>
    <p>A new quiz has been assigned by your teacher.</p>
    <p>Please log in to your portal to review the quiz details and deadlines.</p>
    <p>If you have any questions or need assistance, please do not hesitate to contact your teacher.</p>
    <p>Best regards,</p>
    <p><strong>Inciter Tech</strong></p>
    `;

    this.assignmentMarksTemplate = `
    <h4>Dear {{name}},</h4>
    <p>We hope this message finds you well.</p>
    <p>We are pleased to inform you that your teacher has assigned marks to your recent assignment. Please log in to your portal to review the details of your grades.</p>
    <p>If you have any questions or need further clarification regarding your marks, feel free to reach out to your teacher or our support team.</p>
    <p>Best regards,</p>
    <p><strong>Inciter Tech</strong></p>

`;
  }

  private compileTemplate(template: string, context: any): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
  }

  async sendInvitationEmail(
    email: string,
    name: string,
    tempPassword: string,
    loginUrl: string,
  ) {
    const html = this.compileTemplate(this.invitationTemplate, {
      name,
      email,
      tempPassword,
      loginUrl,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Invitation to Join',
      html,
    });
  }

  async sendRejectionEmail(email: string, name: string) {
    const html = this.compileTemplate(this.rejectionTemplate, { name });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Application Status Update',
      html,
    });
  }

  async sendResetPasswordEmail(
    email: string,
    tempPassword: string,
  ): Promise<void> {
    const html = this.compileTemplate(this.resetPasswordTemplate, {
      email,
      tempPassword,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendAssignmentNotificationEmail(
    email: string,
    name: string,
    title: string,
  ): Promise<void> {
    const html = this.compileTemplate(this.assignmentTemplate, {
      name,
      title,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'New Assignment Created',
      html,
    });
  }

  async sendQuizNotificationEmail(
    email: string,
    name: string,
    title: string,
  ): Promise<void> {
    const html = this.compileTemplate(this.quizTemplate, {
      name,
      title,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'New Quiz Created',
      html,
    });
  }

  async sendAssignmentMarksNotificationEmail(
    email: string,
    name: string,
  ): Promise<void> {
    const html = this.compileTemplate(this.assignmentMarksTemplate, {
      name,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Marks Assigned',
      html,
    });
  }
}
