import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { MembersService } from './members.service';

const mockReportsRepository = () => ({
  find: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReportsService', () => {
  let service: MembersService;
  let membersRepository: MockRepository<Member>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockReportsRepository(),
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    membersRepository = module.get<MockRepository<Member>>(
      getRepositoryToken(Member),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUsersByProject', async () => {
    const member: Member = {
      projectId: undefined,
      userId: undefined,
      role: 'test',
    };
    membersRepository.find.mockResolvedValue([member]);
    const res = await service.getUsersByProject(1);

    expect(res).toEqual([member]);

    expect(membersRepository.find).toHaveBeenCalled();
    expect(membersRepository.find).toHaveBeenCalledWith({
      where: { projectId: 1 },
      relations: ['userId'],
    });
  });
});
