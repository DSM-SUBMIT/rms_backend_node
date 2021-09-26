import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import { ProjectsService } from './projects.service';
import { MailService } from 'src/mail/mail.service';
import { MembersService } from 'src/shared/members/members.service';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Status } from 'src/shared/status/entities/status.entity';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { ProjectItem } from './dto/response/projectItem.dto';

jest.mock('src/mail/mail.service');
jest.mock('src/shared/members/members.service');
jest.mock('src/shared/plans/plans.service');
jest.mock('src/shared/reports/reports.service');
jest.mock('src/shared/status/status.service');

const mockedStatusService = mocked(StatusService, true); // <jest.Mock<StatusService>>StatusService;

const mockedRepository = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: MockRepository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockedRepository(),
        },
        MailService,
        MembersService,
        PlansService,
        ReportsService,
        StatusService,
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectsRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProject', () => {
    it('should return a project', async () => {
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: undefined,
        projectField: undefined,
      };
      projectsRepository.findOne.mockResolvedValue(mockProject);
      const res = await service.getProject(1);

      expect(res).toEqual(mockProject);

      expect(projectsRepository.findOne).toHaveBeenCalled();
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['writerId'],
      });
    });
  });

  describe('findLike', () => {
    it('should return a project', async () => {
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: undefined,
        projectField: undefined,
      };
      projectsRepository.findAndCount.mockResolvedValue([[mockProject], 1]);
      const res = await service.findLike('test', 8, 1);

      expect(res).toEqual([[mockProject], 1]);

      expect(projectsRepository.findAndCount).toHaveBeenCalled();
      expect(projectsRepository.findAndCount).toHaveBeenCalledWith({
        where: { projectName: Like('%test%') },
        take: 8,
        skip: 0,
        relations: ['projectField', 'projectField.fieldId'],
      });
    });
  });

  describe('getConfirmed', () => {
    it('should return confirmed projects', async () => {
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: [],
        projectField: [],
      };
      const mockStatus: Status = {
        projectId: mockProject,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
        reportSubmittedAt: new Date('2021-09-20T00:00:00'),
        isPlanAccepted: true,
        isReportAccepted: true,
      };
      mockedStatusService.prototype.getConfirmedStatus.mockResolvedValue([
        [mockStatus],
        1,
      ]);

      const res = await service.getConfirmed(8, 1);

      const mockProjectItem: ProjectItem = {
        id: 1,
        type: 'test',
        title: 'test',
        team_name: 'test',
        fields: [],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };
      expect(res).toEqual(mockProjectsList);

      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalled();
      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalledWith(8, 1);
    });

    it('should return nothing', async () => {
      mockedStatusService.prototype.getConfirmedStatus.mockResolvedValue([
        [],
        0,
      ]);

      const res = await service.getConfirmed(8, 1);

      expect(res).toEqual(undefined);

      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalled();
      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalledWith(8, 1);
    });
  });
});
