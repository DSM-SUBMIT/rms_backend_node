import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { MailService } from 'src/mail/mail.service';
import { MembersService } from 'src/shared/members/members.service';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

jest.mock('src/mail/mail.service');
jest.mock('src/shared/members/members.service');
jest.mock('src/shared/plans/plans.service');
jest.mock('src/shared/reports/reports.service');
jest.mock('src/shared/status/status.service');

const mockedRepository = () => ({
  findOne: jest.fn(),
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
});
});
