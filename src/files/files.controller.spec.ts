import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { mocked } from 'ts-jest/utils';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

jest.mock('./files.service');

const mockedService = mocked(FilesService, true);

const mockFiles: Express.MulterS3.File[] = [];
const mockRequest: Partial<Request> = { user: { userId: 1 } };

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
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
    it('should call service properly', async () => {
      mockedService.prototype.uploadImages.mockResolvedValue([
        'http://example.com',
      ]);
      const res = await controller.uploadImages(mockFiles, mockRequest, 1);
      expect(res).toEqual(['http://example.com']);
      expect(mockedService.prototype.uploadImages).toHaveBeenCalled();
      expect(mockedService.prototype.uploadImages).toHaveBeenCalledWith(
        mockFiles,
        1,
        1,
      );
    });
  });

  describe('deleteImage', () => {
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
    it('should call service properly', async () => {
      const res = await controller.deleteImage(mockRequest, 1, 'test');
      expect(res).toEqual(undefined);
      expect(mockedService.prototype.deleteImage).toHaveBeenCalled();
      expect(mockedService.prototype.deleteImage).toHaveBeenCalledWith(
        1,
        1,
        'test',
      );
    });
  });

  describe('getImage', () => {
    it('should ensure JwtAuthGuard is applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        FilesController.prototype.deleteImage,
      );
      const jwtAuthGuard = new guards[0]();
      expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
    });
    it('should call service properly', async () => {
      mockedService.prototype.getImage.mockResolvedValue(
        new StreamableFile(Buffer.from('test')),
      );
      const res = await controller.getImage(mockRequest, 1, 'test');
      expect(res).toBeInstanceOf(StreamableFile);
      expect(mockedService.prototype.getImage).toHaveBeenCalled();
      expect(mockedService.prototype.getImage).toHaveBeenCalledWith(
        mockRequest,
        1,
        'test',
      );
    });
  });

  describe('uploadVideo', () => {
    it('should ensure guards are applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        FilesController.prototype.uploadVideo,
      );
      const jwtAuthGuard = new guards[0]();
      const rolesGuard = new guards[1]();

      expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
      expect(rolesGuard).toBeInstanceOf(RolesGuard);
    });
    it('should ensure user role is applied', () => {
      const roles = Reflect.getMetadata(
        'roles',
        FilesController.prototype.uploadVideo,
      );
      const role = roles[0];

      expect(role).toEqual('user');
    });
    it('should return urls', () => {
      controller.uploadVideo(mockFiles[0], mockRequest, 1);
      expect(mockedService.prototype.uploadVideo).toHaveBeenCalled();
      expect(mockedService.prototype.uploadVideo).toHaveBeenCalledWith(
        mockFiles[0],
        1,
        1,
      );
    });
  });

  describe('deleteVideo', () => {
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
    it('should call service properly', async () => {
      controller.deleteVideo(mockRequest, 1);
      expect(mockedService.prototype.deleteVideo).toHaveBeenCalled();
      expect(mockedService.prototype.deleteVideo).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getVideo', () => {
    it('should ensure JwtAuthGuard is applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        FilesController.prototype.deleteImage,
      );
      const jwtAuthGuard = new guards[0]();
      expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
    });
    it('should call service properly', () => {
      controller.getVideo(mockRequest, 1);
      expect(mockedService.prototype.getVideo).toHaveBeenCalled();
      expect(mockedService.prototype.getVideo).toHaveBeenCalledWith(
        mockRequest,
        1,
      );
    });
  });
});
