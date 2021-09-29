import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from 'src/projects/projects.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { FilesService } from './files.service';
import { S3 } from 'aws-sdk';
import { mocked } from 'ts-jest/utils';

jest.mock('src/projects/projects.service');
jest.mock('src/shared/reports/reports.service');
jest.mock('aws-sdk');

const mockedProjectsService = mocked(ProjectsService, true);
const mockedReportsService = mocked(ReportsService, true);
const mockedS3 = mocked(S3, true);

const mockFiles: Express.MulterS3.File[] = [];

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService, ProjectsService, ReportsService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getS3', () => {
    it('should return S3 object', () => {
      expect(service.getS3()).toBeInstanceOf(S3);
    });
  });
});
