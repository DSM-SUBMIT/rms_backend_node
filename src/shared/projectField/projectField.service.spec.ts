import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectField } from './entities/projectField.entity';
import { ProjectFieldService } from './projectField.service';

const mockProjectFieldRepository = () => ({
  find: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReportsService', () => {
  let service: ProjectFieldService;
  let projectFieldRepository: MockRepository<ProjectField>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectFieldService,
        {
          provide: getRepositoryToken(ProjectField),
          useValue: mockProjectFieldRepository(),
        },
      ],
    }).compile();

    service = module.get<ProjectFieldService>(ProjectFieldService);
    projectFieldRepository = module.get<MockRepository<ProjectField>>(
      getRepositoryToken(ProjectField),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFieldsByProject', () => {
    it('should return a list of fields', async () => {
      projectFieldRepository.find.mockResolvedValue(['field1', 'field2']);
      expect(await service.getFieldsByProject(1)).toEqual(['field1', 'field2']);
    });
    it('should return an empty list', async () => {
      projectFieldRepository.find.mockResolvedValue([]);
      expect(await service.getFieldsByProject(1)).toEqual([]);
    });
  });
});
