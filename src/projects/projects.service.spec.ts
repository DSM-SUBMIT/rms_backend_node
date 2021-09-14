import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MembersService } from 'src/shared/members/members.service';
import { Plan } from 'src/shared/plans/entities/plan.entity';
import { PlansService } from 'src/shared/plans/plans.service';
import { Report } from 'src/shared/reports/entities/report.entity';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { UsersService } from 'src/shared/users/users.service';
import { Like, Repository } from 'typeorm';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';
import { Project } from './entities/project.entity';
import { ProjectItem } from './interfaces/projectItem.interface';
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
const mockStatusPlan = [
  {
    projectId: {
      userId: 1,
      teamName: 'test',
      projectName: 'test',
      projectType: 'test',
      projectField: [
        {
          fieldId: {
            id: 1,
            field: 'test',
          },
        },
      ],
    },
  },
];

const mockProjectItem: Project = {
  id: 1,
  projectType: 'test',
  projectName: 'test',
  teamName: 'test',
  userId: {
    id: 1,
    name: 'test',
    email: 'test@example.com',
    userId: [],
    projects: [],
  },
  projectField: [],
  techStacks: '',
  githubUrl: null,
  serviceUrl: null,
  docsUrl: null,
  teacher: 'test',
  projectId: [],
};
const planItem: Plan = {
  projectId: mockProjectItem,
  goal: 'test',
  content: 'test',
  startDate: '2021.09',
  endDate: '2021.09',
  pdfUrl: '',
  includeResultReport: true,
  includeCode: true,
  includeOutcome: true,
  includeOthers: null,
};
const planDetail: PlanDetailDto = {
  project_name: 'test',
  writer: 'test',
  members: [{ name: 'test', role: 'test' }],
  goal: 'test',
  content: 'test',
  start_date: '2021.09',
  end_date: '2021.09',
  includes: {
    result_report: true,
    code: true,
    outcome: true,
    others: false,
    others_content: '',
  },
};
const reportItem: Report = {
  projectId: mockProjectItem,
  videoUrl: 'http://example.com',
  pdfUrl: 'test',
  content: 'test',
};
const reportDetail: ReportDetailDto = {
  project_name: 'test',
  writer: 'test',
  members: [{ name: 'test', role: 'test' }],
  video_url: 'http://example.com',
  content: 'test',
};
const mockProjectsRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
});
const mockMembersService = () => ({
  getUsersByProject: jest.fn().mockResolvedValue([
    {
      projectId: mockProjectItem,
      userId: {
        id: 1,
        name: 'test',
        email: 'test@example.com',
        userId: [],
        projects: [],
      },
      role: 'test',
    },
  ]),
});
const mockPlansService = () => ({
  getPlanById: jest.fn().mockImplementation(async (id) => {
    if (id !== planItem.projectId.id) return undefined;
    return planItem;
  }),
});
const mockReportsService = () => ({
  getReportById: jest.fn().mockImplementation(async (id) => {
    if (id !== reportItem.projectId.id) return undefined;
    return reportItem;
  }),
});
const mockStatusService = () => ({
  getStatusById: jest.fn().mockImplementation(async (id) => {
    if (id !== mockStatus[id].projectId) return undefined;
    return mockStatus[id];
  }),
  getStatusDescByPlanDate: jest.fn().mockImplementation(async (limit, page) => {
    return page === 1 ? mockStatusPlan : [];
  }),
  getStatusDescByReportDate: jest
    .fn()
    .mockImplementation(async (limit, page) => {
      return page === 1 ? mockStatusPlan : [];
    }),
  updatePlanAccepted: jest.fn(),
  updateReportAccepted: jest.fn(),
});
const mockUsersService = () => ({
  getUserById: jest.fn(),
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
          provide: MembersService,
          useValue: mockMembersService(),
        },
        {
          provide: PlansService,
          useValue: mockPlansService(),
        },
        {
          provide: ReportsService,
          useValue: mockReportsService(),
        },
        {
          provide: StatusService,
          useValue: mockStatusService(),
        },
        {
          provide: UsersService,
          useValue: mockUsersService(),
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
      it('should return nothing(action: approve)', async () => {
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
      it('should return nothing(action: deny)', async () => {
        const result = await service.confirmProject(1, 'plan', {
          type: 'deny',
          comment: 'test',
        });

        expect(statusService.getStatusById).toHaveBeenCalledTimes(1);
        expect(statusService.updatePlanAccepted).toHaveBeenCalledTimes(1);

        expect(statusService.getStatusById).toHaveBeenCalledWith(1);
        expect(statusService.updatePlanAccepted).toHaveBeenCalledWith(1, false);

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
      it('should return nothing(action: approve)', async () => {
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

      it('should return nothing(action: deny)', async () => {
        const result = await service.confirmProject(1, 'report', {
          type: 'deny',
          comment: 'test',
        });

        expect(statusService.getStatusById).toHaveBeenCalledTimes(1);
        expect(statusService.updateReportAccepted).toHaveBeenCalledTimes(1);

        expect(statusService.getStatusById).toHaveBeenCalledWith(1);
        expect(statusService.updateReportAccepted).toHaveBeenCalledWith(
          1,
          false,
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

  describe('getPendingProjects', () => {
    describe('plan', () => {
      it('should return entity', async () => {
        expect(service.getPendingProjects('plan', 8, 1)).resolves.toEqual({
          projects: [
            {
              type: 'test',
              title: 'test',
              team_name: 'test',
              fields: ['test'],
            },
          ],
          order_by: 'plan',
        });
      });
      it('should return undefined', async () => {
        expect(
          service.getPendingProjects('plan', 8, 2),
        ).resolves.toBeUndefined();
      });
    });

    describe('report', () => {
      it('should return entity', async () => {
        expect(service.getPendingProjects('report', 8, 1)).resolves.toEqual({
          projects: [
            {
              type: 'test',
              title: 'test',
              team_name: 'test',
              fields: ['test'],
            },
          ],
          order_by: 'report',
        });
      });
      it('should return undefined', async () => {
        expect(
          service.getPendingProjects('report', 8, 2),
        ).resolves.toBeUndefined();
      });
    });
  });

  describe('search', () => {
    it('should return array of projects', async () => {
      const projectList = new Array<ProjectItem>({
        id: 1,
        type: 'test',
        title: 'test',
        team_name: 'test',
        fields: ['test'],
      });
      const projectItem = new Array({
        id: 1,
        projectType: 'test',
        projectName: 'test',
        teamName: 'test',
        projectField: [
          {
            fieldId: {
              field: 'test',
            },
          },
        ],
      });
      projectsRepository.find.mockResolvedValue(projectItem);
      expect(await service.search('test')).toEqual(projectList);
    });

    it('should return nothing', async () => {
      projectsRepository.find.mockResolvedValue([]);
      expect(await service.search('test')).toBeFalsy();
    });
  });

  describe('getDetail', () => {
    describe('plan', () => {
      it('should return plan detail', async () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(mockProjectItem);
        expect(await service.getDetail(1, 'plan')).toEqual(planDetail);
      });
      it('should throw NotFoundException', () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(undefined);
        expect(service.getDetail(1, 'plan')).rejects.toThrow(NotFoundException);
      });
      it('should return nothing', async () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(mockProjectItem);
        expect(await service.getDetail(2, 'plan')).toBeFalsy();
      });
    });

    describe('report', () => {
      it('should return report detail', async () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(mockProjectItem);
        expect(await service.getDetail(1, 'report')).toEqual(reportDetail);
      });
      it('should throw NotFoundException', () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(undefined);
        expect(service.getDetail(1, 'report')).rejects.toThrow(
          NotFoundException,
        );
      });
      it('should return nothing', async () => {
        jest.spyOn(service, 'getProject').mockResolvedValue(mockProjectItem);
        expect(await service.getDetail(2, 'report')).toBeFalsy();
      });
    });
  describe('findLike', () => {
    const callOptions = {
      where: { projectName: Like(`%query%`) },
      relations: ['projectField', 'projectField.fieldId'],
    };

    it('should return projects', async () => {
      projectsRepository.find.mockResolvedValue(['project', 'project']);

      expect(await service.findLike('query')).toEqual(['project', 'project']);

      expect(projectsRepository.find).toHaveBeenCalledTimes(1);
      expect(projectsRepository.find).toHaveBeenCalledWith(callOptions);
    });
    it('should return an empty array', async () => {
      projectsRepository.find.mockResolvedValue([]);

      expect(await service.findLike('query')).toEqual([]);

      expect(projectsRepository.find).toHaveBeenCalledTimes(1);
      expect(projectsRepository.find).toHaveBeenCalledWith(callOptions);
    });
  });

  describe('getProject', () => {
    it('should return undefined', async () => {
      projectsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.getProject(1);

      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['userId'],
      });

      expect(result).toBeUndefined();
    });
    it('should return project', async () => {
      projectsRepository.findOne.mockResolvedValue('project');

      const result = await service.getProject(1);

      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['userId'],
      });

      expect(result).toEqual('project');
    });
  });
});
