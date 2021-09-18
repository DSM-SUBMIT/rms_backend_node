import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { UsersService } from 'src/shared/users/users.service';
import { FilesService } from './files.service';

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
});
