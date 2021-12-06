import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { S3 } from 'aws-sdk';
import { mocked } from 'ts-jest/utils';
import { ProjectRepository } from '../shared/entities/project/project.repository';

jest.mock('src/shared/entities/project/project.repository');
jest.mock('aws-sdk');

const mockedS3 = mocked(S3, true);

const mockFiles: Express.MulterS3.File[] = [];

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService, ProjectRepository],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getS3', () => {
    it('should return S3 object', () => {
      expect(service.getS3()).toBeInstanceOf(S3);
    });
  });
});
