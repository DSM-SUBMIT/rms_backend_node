import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const mockProjectsRepository = () => ({
  findOne: jest.fn(),
});
const mockStatusService = () => ({
  getStatusById: jest.fn(),
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
          provide: StatusService,
          useValue: mockStatusService(),
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
