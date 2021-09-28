import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { mocked } from 'ts-jest/utils';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import * as ejs from 'ejs';

jest.mock('fs');
jest.mock('util');
jest.mock('path');
jest.mock('ejs');
jest.mock('@nestjs-modules/mailer');

const mockedMailerService = mocked(MailerService, true);
const mockedPromisify = mocked(promisify, true);
const mockedPath = mocked(path, true);
const mockedEjs = mocked(ejs, true);

mockedPath.join.mockImplementation(
  (...paths: string[]) => paths[paths.length - 1],
);
mockedEjs.render.mockImplementation((...args: any[]) => args[1]);

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService, MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should return nothing', async () => {
      const mockedReadFile = jest.fn();

      mockedMailerService.prototype.sendMail.mockResolvedValue(undefined);
      mockedPromisify.mockImplementation((arg: any) => mockedReadFile);

      const res = await service.sendMail(
        'test@example.com',
        'test',
        'planApproved',
        { test: 'test' },
      );

      expect(res).toEqual(undefined);

      expect(mockedPath.join).toHaveBeenCalled();
      expect(mockedPath.join).toHaveBeenCalledWith(
        __dirname,
        './templates/plan-approved.ejs',
      );

      expect(mockedReadFile).toHaveBeenCalled();
      expect(mockedReadFile).toHaveBeenCalledWith(
        './templates/plan-approved.ejs',
        'utf-8',
      );

      expect(mockedMailerService.prototype.sendMail).toHaveBeenCalled();
      expect(mockedMailerService.prototype.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: process.env.OAUTH_USER,
        subject: 'test',
        html: {
          test: 'test',
        },
      });
    });
  });
});
