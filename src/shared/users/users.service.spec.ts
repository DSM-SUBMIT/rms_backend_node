import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockUsersRepository = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return an user', async () => {
      const user = {
        id: 1,
        email: 'foo@bar.com',
        name: 'foo',
        projects: [{ id: 1 }],
        userId: [{ id: 1 }],
      };
      usersRepository.findOne.mockResolvedValue(user);
      expect(await service.getUserById(1)).toEqual(user);
    });
    it('should return null', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      expect(await service.getUserById(1)).toBeNull();
    });
  });
});
