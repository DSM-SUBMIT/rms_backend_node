import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

const mockProjectsRepository = () => ({
  findOne: jest.fn(),
});
const mockStatusService = () => ({
  getStatusById: jest.fn(),
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
          useValue: mockProjectsRepository(),
        },
        {
          provide: StatusService,
          useValue: mockStatusService(),
        },
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
