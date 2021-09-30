import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { PlansService } from './plans.service';

const mockPlansRepository = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('PlansService', () => {
  let service: PlansService;
  let plansRepository: MockRepository<Plan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: getRepositoryToken(Plan), useValue: mockPlansRepository() },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    plansRepository = module.get<MockRepository<Plan>>(
      getRepositoryToken(Plan),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlanById', () => {
    it('should return a plan object', async () => {
      const mockPlan: Plan = {
        projectId: undefined,
        goal: 'test',
        content: 'test',
        startDate: '2021.09',
        endDate: '2021.09',
        includeResultReport: true,
        includeCode: true,
        includeOutcome: true,
        includeOthers: null,
      };
      plansRepository.findOne.mockResolvedValue(mockPlan);

      const res = await service.getPlanById(1);

      expect(res).toEqual(mockPlan);

      expect(plansRepository.findOne).toHaveBeenCalled();
      expect(plansRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['projectId', 'projectId.writerId'],
      });
    });
  });
});
