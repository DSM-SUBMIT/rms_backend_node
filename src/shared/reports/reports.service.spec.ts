import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportsService } from './reports.service';

const mockReportsRepository = () => ({
  findOne: jest.fn(),
  update: jest
    .fn()
    .mockImplementation(async (criteria: number, entity: any) => {
      if (criteria === 1) return { affected: 1 };
      else return { affected: 0 };
    }),
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

  describe('getReportById', () => {
    it('should return return a report', async () => {
      reportsRepository.findOne.mockResolvedValue('report');

      expect(await service.getReportById(1)).toEqual('report');

      expect(reportsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(reportsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['projectId', 'projectId.writerId'],
      });
    });

    it('should return null', async () => {
      reportsRepository.findOne.mockResolvedValue(null);

      expect(await service.getReportById(2)).toBeNull();

      expect(reportsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(reportsRepository.findOne).toHaveBeenCalledWith(2, {
        relations: ['projectId', 'projectId.writerId'],
      });
    });
  });

  describe('updateVideoUrl', () => {
    it('should return true', async () => {
      expect(await service.updateVideoUrl(1, 'http://example.com')).toEqual(
        true,
      );

      expect(reportsRepository.update).toHaveBeenCalledTimes(1);
      expect(reportsRepository.update).toHaveBeenCalledWith(1, {
        videoUrl: 'http://example.com',
      });
    });
    it('should return false', async () => {
      expect(await service.updateVideoUrl(2, 'http://example.com')).toEqual(
        false,
      );

      expect(reportsRepository.update).toHaveBeenCalledTimes(1);
      expect(reportsRepository.update).toHaveBeenCalledWith(2, {
        videoUrl: 'http://example.com',
      });
    });
  });
});
