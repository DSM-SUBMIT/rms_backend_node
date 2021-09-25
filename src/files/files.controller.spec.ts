import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
jest.mock('./files.service');

const mockFiles: Express.MulterS3.File[] = [];
const mockRequest: Partial<Request> = { user: { userId: 1 } };

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImages', () => {
    it('should ensure guards are applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        FilesController.prototype.uploadImages,
      );
      const jwtAuthGuard = new guards[0]();
      const rolesGuard = new guards[1]();

      expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
      expect(rolesGuard).toBeInstanceOf(RolesGuard);
    });
    it('should ensure user role is applied', () => {
      const roles = Reflect.getMetadata(
        'roles',
        FilesController.prototype.uploadImages,
      );
      const role = roles[0];

      expect(role).toEqual('user');
    });
    it('should return urls', () => {
      controller.uploadImages(mockFiles, mockRequest, 1);
      expect(service.uploadImages).toHaveBeenCalled();
      expect(service.uploadImages).toHaveBeenCalledWith(mockFiles, 1, 1);
    });
  });
});
