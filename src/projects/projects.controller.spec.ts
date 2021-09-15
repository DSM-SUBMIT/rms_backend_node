import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MembersService } from 'src/shared/members/members.service';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { UsersService } from 'src/shared/users/users.service';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const mockProjectsRepository = () => ({
  findOne: jest.fn(),
});
const mockMembersService = () => ({
  getUsersByProject: jest.fn(),
});
const mockPlansService = () => ({
  getPlanById: jest.fn(),
});
const mockReportsService = () => ({
  getReportById: jest.fn(),
});
const mockStatusService = () => ({
  getStatusById: jest.fn(),
});
const mockUsersService = () => ({
  getUserById: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsRepository: MockRepository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
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
        ProjectsService,
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
