import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Status } from './entities/status.entity';
import { StatusService } from './status.service';

const mockStatusRepository = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('StatusService', () => {
  let service: StatusService;
  let statusRepository: MockRepository<Status>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: getRepositoryToken(Status),
          useValue: mockStatusRepository(),
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
    statusRepository = module.get<MockRepository<Status>>(
      getRepositoryToken(Status),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatusById', () => {
    const mockStatus = [
      {
        projectId: 1,
        isPlanSubmitted: false,
        isReportSubmitted: false,
        planSubmittedAt: null,
        reportSubmittedAt: null,
        isPlanAccepted: false,
        isReportAccepted: false,
      },
      1,
    ];

    it('should return Status', async () => {
      statusRepository.findOne.mockResolvedValue(mockStatus);

      const result = await service.getStatusById(1);

      expect(statusRepository.findOne).toHaveBeenCalledTimes(1);
      expect(statusRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['projectId', 'projectId.writerId'],
      });

      expect(result).toEqual(mockStatus);
    });

    it('should return nothing', async () => {
      statusRepository.findOne.mockResolvedValue(undefined);

      const result = await service.getStatusById(1);

      expect(statusRepository.findOne).toHaveBeenCalledTimes(1);
      expect(statusRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['projectId', 'projectId.writerId'],
      });

      expect(result).toBeUndefined();
    });
  });

  describe('updatePlanAccepted', () => {
    it('should return true', async () => {
      statusRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updatePlanAccepted(1, true);

      expect(statusRepository.update).toHaveBeenCalledTimes(1);
      expect(statusRepository.update).toHaveBeenCalledWith(1, {
        isPlanAccepted: true,
      });

      expect(result).toBeTruthy();
    });

    it('should return true', async () => {
      statusRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updatePlanAccepted(1, false);

      expect(statusRepository.update).toHaveBeenCalledTimes(2);
      expect(statusRepository.update).toHaveBeenNthCalledWith(1, 1, {
        isPlanAccepted: false,
      });
      expect(statusRepository.update).toHaveBeenNthCalledWith(2, 1, {
        isPlanSubmitted: false,
      });

      expect(result).toEqual(true);
    });

    it('should return false', async () => {
      statusRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.updatePlanAccepted(2, true);

      expect(statusRepository.update).toHaveBeenCalledTimes(1);
      expect(statusRepository.update).toHaveBeenCalledWith(2, {
        isPlanAccepted: true,
      });

      expect(result).toBeFalsy();
    });
  });
  describe('updateReportAccepted', () => {
    it('should return true', async () => {
      statusRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateReportAccepted(1, true);

      expect(statusRepository.update).toHaveBeenCalledTimes(1);
      expect(statusRepository.update).toHaveBeenCalledWith(1, {
        isReportAccepted: true,
      });

      expect(result).toBeTruthy();
    });

    it('should return true', async () => {
      statusRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateReportAccepted(1, false);

      expect(statusRepository.update).toHaveBeenCalledTimes(2);
      expect(statusRepository.update).toHaveBeenNthCalledWith(1, 1, {
        isReportAccepted: false,
      });
      expect(statusRepository.update).toHaveBeenNthCalledWith(2, 1, {
        isReportSubmitted: false,
      });

      expect(result).toEqual(true);
    });

    it('should return false', async () => {
      statusRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.updateReportAccepted(2, true);

      expect(statusRepository.update).toHaveBeenCalledTimes(1);
      expect(statusRepository.update).toHaveBeenCalledWith(2, {
        isReportAccepted: true,
      });

      expect(result).toBeFalsy();
    });
  });

  describe('getConfirmStatus', () => {
    it('should return a status object', async () => {
      const mockStatus: Status = {
        projectId: undefined,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        reportSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        isPlanAccepted: true,
        isReportAccepted: true,
      };
      statusRepository.findAndCount.mockResolvedValue([[mockStatus], 1]);
      const res = await service.getConfirmedStatus(8, 1);

      expect(res).toEqual([[mockStatus], 1]);

      expect(statusRepository.findAndCount).toHaveBeenCalled();
      expect(statusRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          isPlanAccepted: true,
          isReportAccepted: true,
        },
        order: {
          planSubmittedAt: 'ASC',
        },
        take: 8,
        skip: 8 * (1 - 1),
        relations: [
          'projectId',
          'projectId.projectField',
          'projectId.projectField.fieldId',
        ],
      });
    });
  });

  describe('getStatusDescByPlanDate', () => {
    it('should return a status object', async () => {
      const mockStatus: Status = {
        projectId: undefined,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        reportSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        isPlanAccepted: true,
        isReportAccepted: true,
      };
      statusRepository.findAndCount.mockResolvedValue([[mockStatus], 1]);
      const res = await service.getStatusDescByPlanDate(8, 1);

      expect(res).toEqual([[mockStatus], 1]);

      expect(statusRepository.findAndCount).toHaveBeenCalled();
      expect(statusRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          isPlanSubmitted: true,
          isPlanAccepted: IsNull(),
        },
        order: {
          planSubmittedAt: 'ASC',
        },
        take: 8,
        skip: 8 * (1 - 1),
        relations: [
          'projectId',
          'projectId.projectField',
          'projectId.projectField.fieldId',
        ],
      });
    });
  });

  describe('getStatusDescByReportDate', () => {
    it('should return a status object', async () => {
      const mockStatus: Status = {
        projectId: undefined,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        reportSubmittedAt: new Date('2021.09.28T00:00:00Z'),
        isPlanAccepted: true,
        isReportAccepted: true,
      };
      statusRepository.findAndCount.mockResolvedValue([[mockStatus], 1]);
      const res = await service.getStatusDescByReportDate(8, 1);

      expect(res).toEqual([[mockStatus], 1]);

      expect(statusRepository.findAndCount).toHaveBeenCalled();
      expect(statusRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          isReportSubmitted: true,
          isReportAccepted: IsNull(),
        },
        order: {
          reportSubmittedAt: 'ASC',
        },
        take: 8,
        skip: 8 * (1 - 1),
        relations: [
          'projectId',
          'projectId.projectField',
          'projectId.projectField.fieldId',
        ],
      });
    });
  });
});
