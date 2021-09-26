import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { UsersService } from 'src/shared/users/users.service';
import { FilesService } from './files.service';
import { S3 } from 'aws-sdk';

jest.mock('aws-sdk');

const mockPlansService = () => ({
  getPlanById: jest.fn(),
  updatePdfUrl: jest.fn(),
});
const mockReportsService = () => ({
  getReportById: jest.fn(),
  updatePdfUrl: jest.fn(),
});
const mockUsersService = () => ({
  getUserById: jest.fn(),
});

const mockFiles: Express.MulterS3.File[] = [];

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PlansService,
          useValue: mockPlansService(),
        },
        {
          provide: ReportsService,
          useValue: mockReportsService(),
        },
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
        FilesService,
      ],
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
