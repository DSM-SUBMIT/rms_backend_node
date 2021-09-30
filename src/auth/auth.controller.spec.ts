import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ChangePwDto } from './dto/request/changePw.dto';
import { LoginDto } from './dto/request/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
jest.mock('./auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call the service', async () => {
      const payload: LoginDto = { id: 'test', password: 'test' };
      controller.login(payload);
      expect(service.login).toHaveBeenCalled();
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(payload);
    });
  });

  describe('changePw', () => {
    it('should ensure the JwtAuthGuard is applied', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.changePw,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
    it('should ensure the RolesGuard is applied', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.changePw,
      );
      const guard = new guards[1]();

      expect(guard).toBeInstanceOf(RolesGuard);
    });
    it('should call the service', async () => {
      const payload: ChangePwDto = { oldPassword: 'test', newPassword: 'test' };
      const req: any = { user: { userId: 'test' } };
      controller.changePw(req, payload);
      expect(service.changePw).toHaveBeenCalled();
      expect(service.changePw).toHaveBeenCalledTimes(1);
      expect(service.changePw).toHaveBeenCalledWith(req.user.userId, payload);
    });
  });
});
