import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    receiver: string,
    subject: string,
    templateType:
      | 'planApproved'
      | 'planDenied'
      | 'reportApproved'
      | 'reportDenied',
    context: any = {},
  ) {
    const template = {
      planApproved: 'plan-approved',
      planDenied: 'plan-denied',
      reportApproved: 'report-approved',
      reportDenied: 'report-denied',
    };
    const readFile = promisify(fs.readFile);
    const content = await readFile(
      path.join(__dirname, `./templates/${template[templateType]}.ejs`),
      'utf-8',
    );

    await this.mailerService.sendMail({
      to: receiver,
      from: process.env.OAUTH_USER,
      subject,
      html: ejs.render(content, context),
    });
  }
}
