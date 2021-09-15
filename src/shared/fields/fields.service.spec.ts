import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from 'src/shared/fields/entities/field.entity';
import { FieldsService } from 'src/shared/fields/fields.service';

const mockProjectFieldRepository = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReportsService', () => {
  let service: FieldsService;
  let projectFieldRepository: MockRepository<Field>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldsService,
        {
          provide: getRepositoryToken(Field),
          useValue: mockProjectFieldRepository(),
        },
      ],
    }).compile();

    service = module.get<FieldsService>(FieldsService);
    projectFieldRepository = module.get<MockRepository<Field>>(
      getRepositoryToken(Field),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFieldById', () => {
    it('should return a list of fields', async () => {
      projectFieldRepository.findOne.mockResolvedValue({ field: 'field' });
      expect(await service.getFieldById(1)).toEqual({ field: 'field' });
    });
    it('should return an empty list', async () => {
      projectFieldRepository.findOne.mockResolvedValue({});
      expect(await service.getFieldById(1)).toEqual({});
    });
  });
});
