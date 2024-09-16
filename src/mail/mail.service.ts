import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly invitationTemplate: string;
  private readonly rejectionTemplate: string;
  private readonly resetPasswordTemplate: string;

  constructor(private readonly mailerService: MailerService) {
    this.invitationTemplate = `
      <h1>Hello {{name}},</h1>
      <p>You have been invited to join our course. Below are your login details:</p>
      <ul>
        <li><strong>Email:</strong> {{email}}</li>
        <li><strong>Temporary Password:</strong> {{tempPassword}}</li>
      </ul>
      <p>Please login and reset your password by clicking the link below:</p>
      <a href="{{loginUrl}}">Login and Reset Password</a>
      <p>Thank you!</p>
    `;

    this.rejectionTemplate = `
      <h1>Hello {{name}},</h1>
      <p>Thank you for your interest in our course. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
      <p>We appreciate the effort you put into applying, and we encourage you to apply again for future opportunities.</p>
      <p>If you have any questions, feel free to reach out.</p>
      <p>Best regards,</p>
      <p>The Admissions Team</p>
    `;

    this.resetPasswordTemplate = `
    <h4>Hello,</h4>
    <p>Your new password is <strong>{{tempPassword}}</strong></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
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
}
