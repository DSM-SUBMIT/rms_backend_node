import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockAdminRepository = () => ({
  findOne: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let adminsRepository: MockRepository<Admin>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminsRepository = module.get<MockRepository<Admin>>(
      getRepositoryToken(Admin),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    mockedBcrypt.compare.mockImplementation(async (data, encrypted) => {
      return data === encrypted;
    });
    const admin: Admin = { id: 'test', password: 'test' };
    it('should return true', async () => {
      adminsRepository.findOne.mockResolvedValue(admin);
      const res = await service.validateUser('test', 'test');

      expect(res).toEqual(true);

      expect(adminsRepository.findOne).toHaveBeenCalled();
      expect(adminsRepository.findOne).toHaveBeenCalledWith('test');

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('test', 'test');
    });
    it('should return false - user not found', async () => {
      adminsRepository.findOne.mockResolvedValue(undefined);
      const res = await service.validateUser('test', 'test');

      expect(res).toEqual(false);

      expect(adminsRepository.findOne).toHaveBeenCalled();
      expect(adminsRepository.findOne).toHaveBeenCalledWith('test');

      expect(bcrypt.compare).toHaveBeenCalledTimes(0);
    });
    it('should return false - invalid password', async () => {
      adminsRepository.findOne.mockResolvedValue(admin);
      const res = await service.validateUser('test', 'wrong password');

      expect(res).toEqual(false);

      expect(adminsRepository.findOne).toHaveBeenCalled();
      expect(adminsRepository.findOne).toHaveBeenCalledWith('test');

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong password', 'test');
    });
  });
});
