import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwtPayload';
import { ChangePwDto } from './dto/request/changePw.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockAdminRepository = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('token'),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let adminsRepository: MockRepository<Admin>;
  let jwtService: JwtService;

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
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('encrypt', () => {
    mockedBcrypt.hash.mockImplementation(() =>
      Promise.resolve('hashed_password'),
    );
    it('should return hashed password', async () => {
      const res = await service.encrypt('test');

      expect(res).toEqual('hashed_password');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('test', 12);
    });
  });

  describe('signJwt', () => {
    it('should return signed JWT token', async () => {
      const payload: JwtPayload = { sub: 'test', role: 'admin' };
      const res = await service.signJwt(payload);

      expect(res).toEqual({ access_token: 'token' });

      expect(jwtService.sign).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('changePw', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return nothing', async () => {
      const admin: Admin = { id: 'test', password: 'test' };
      adminsRepository.findOne.mockResolvedValue(admin);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      adminsRepository.update.mockResolvedValue({
        generatedMaps: [{ id: 'test', password: 'encrypted_password' }],
        affected: 1,
      });
      const password: ChangePwDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      const res = await service.changePw('test', password);

      expect(res).toEqual(undefined);

      expect(adminsRepository.update).toHaveBeenCalled();
      expect(adminsRepository.update).toHaveBeenCalledWith('test', {
        password: 'hashed_password',
      });
    });
    it('should throw ConflictException', async () => {
      const admin: Admin = { id: 'test', password: 'test' };
      adminsRepository.findOne.mockResolvedValue(admin);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      try {
        await service.changePw('test', {
          oldPassword: 'test',
          newPassword: 'test',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
    });
    it('should throw UnauthorizedException', async () => {
      adminsRepository.findOne.mockResolvedValue(undefined);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(false));
      try {
        await service.changePw('test', {
          oldPassword: 'test',
          newPassword: 'test',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
