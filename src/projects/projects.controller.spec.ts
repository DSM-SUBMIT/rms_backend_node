import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { mocked } from 'ts-jest/utils';
import { ConfirmProjectDto } from './dto/request/confirmProject.dto';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

jest.mock('./projects.service');

const mockedProjectsService = mocked(ProjectsService, true);

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should ensure the guards is applied to the controller', async () => {
    const guards = Reflect.getMetadata('__guards__', ProjectsController);
    const jwtAuthGuard = new guards[0]();
    const rolesGuard = new guards[1]();

    expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
    expect(rolesGuard).toBeInstanceOf(RolesGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('confirm', () => {
    it('should return nothing', async () => {
      mockedProjectsService.prototype.confirmProject.mockResolvedValue(
        undefined,
      );

      const mockedRequest: ConfirmProjectDto = {
        type: 'approve',
        comment: 'test',
      };
      const res = await controller.confirm(1, 'plan', mockedRequest);

      expect(res).toEqual(undefined);

      expect(mockedProjectsService.prototype.confirmProject).toHaveBeenCalled();
      expect(
        mockedProjectsService.prototype.confirmProject,
      ).toHaveBeenCalledWith(1, 'plan', mockedRequest);
    });
  });
});
