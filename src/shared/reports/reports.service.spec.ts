import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportsService } from './reports.service';

const mockReportsRepository = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsRepository: MockRepository<Report>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportsRepository(),
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportsRepository = module.get<MockRepository<Report>>(
      getRepositoryToken(Report),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
