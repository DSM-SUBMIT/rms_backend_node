import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

const mockStatus = [
  {},
  {
    projectId: 1,
    isPlanSubmitted: true,
    isReportSubmitted: true,
    planSubmittedAt: null,
    reportSubmittedAt: null,
    isPlanAccepted: null,
    isReportAccepted: null,
  },
  {},
  {
    projectId: 3,
    isPlanSubmitted: false,
    isReportSubmitted: false,
    planSubmittedAt: null,
    reportSubmittedAt: null,
    isPlanAccepted: null,
    isReportAccepted: null,
  },
  {
    projectId: 4,
    isPlanSubmitted: true,
    isReportSubmitted: true,
    planSubmittedAt: null,
    reportSubmittedAt: null,
    isPlanAccepted: true,
    isReportAccepted: true,
  },
  {
    projectId: 5,
    isPlanSubmitted: true,
    isReportSubmitted: true,
    planSubmittedAt: null,
    reportSubmittedAt: null,
    isPlanAccepted: false,
    isReportAccepted: false,
  },
];

const mockProjectsRepository = () => ({
  findOne: jest.fn(),
});
const mockStatusService = () => ({
  getStatusById: jest.fn().mockImplementation(async (id) => {
    if (id !== mockStatus[id].projectId) return undefined;
    return mockStatus[id];
  }),
  updatePlanAccepted: jest.fn(),
  updateReportAccepted: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let statusService: StatusService;
  let projectsRepository: MockRepository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository(),
        },
        {
          provide: StatusService,
          useValue: mockStatusService(),
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    statusService = module.get<StatusService>(StatusService);
    projectsRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmProject', () => {
    describe('plan', () => {
      it('should return nothing', async () => {
        const result = await service.confirmProject(1, 'plan', {
          type: 'approve',
          comment: 'test',
        });

        expect(statusService.getStatusById).toHaveBeenCalledTimes(1);
        expect(statusService.updatePlanAccepted).toHaveBeenCalledTimes(1);

        expect(statusService.getStatusById).toHaveBeenCalledWith(1);
        expect(statusService.updatePlanAccepted).toHaveBeenCalledWith(1, true);

        expect(result).toBeUndefined();
      });
      it('should throw NotFoundException', () => {
        expect(
          service.confirmProject(2, 'plan', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(NotFoundException);
      });
      it('should throw ConflictException', () => {
        expect(
          service.confirmProject(3, 'plan', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
        expect(
          service.confirmProject(4, 'plan', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
        expect(
          service.confirmProject(5, 'plan', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('report', () => {
      it('should return nothing', async () => {
        const result = await service.confirmProject(1, 'report', {
          type: 'approve',
          comment: 'test',
        });

        expect(statusService.getStatusById).toHaveBeenCalledTimes(1);
        expect(statusService.updateReportAccepted).toHaveBeenCalledTimes(1);

        expect(statusService.getStatusById).toHaveBeenCalledWith(1);
        expect(statusService.updateReportAccepted).toHaveBeenCalledWith(
          1,
          true,
        );

        expect(result).toBeUndefined();
      });
      it('should throw NotFoundException', () => {
        expect(
          service.confirmProject(2, 'report', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(NotFoundException);
      });
      it('should throw ConflictException', () => {
        expect(
          service.confirmProject(3, 'report', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
        expect(
          service.confirmProject(4, 'report', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
        expect(
          service.confirmProject(5, 'report', {
            type: 'approve',
            comment: 'test',
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    it('should throw BadRequestException', () => {
      expect(
        service.confirmProject(1, 'this will throw error', {
          type: 'approve',
          comment: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProject', () => {
    it('should return undefined', async () => {
      projectsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.getProject(1);

      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1);

      expect(result).toBeUndefined();
    });
    it('should return project', async () => {
      projectsRepository.findOne.mockResolvedValue('project');

      const result = await service.getProject(1);

      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1);

      expect(result).toEqual('project');
    });
  });
});
