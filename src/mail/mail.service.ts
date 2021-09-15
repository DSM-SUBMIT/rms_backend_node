import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    receiver: string,
    subject: string,
    template: string,
    context: any = {},
  ) {
    try {
      await this.mailerService.sendMail({
        to: receiver,
        from: process.env.OAUTH_USER,
        subject,
        template: `./${template}`,
        context,
      });
    } catch (e) {
      throw new Error(e);
    }
  }
}
