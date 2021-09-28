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

  describe('getPendingProjects', () => {
    it('should return list of projects', async () => {
      const mockProjectItem: ProjectItem = {
        id: 1,
        type: 'test',
        title: 'test',
        team_name: 'test',
        fields: ['test'],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };

      mockedProjectsService.prototype.getPendingProjects.mockResolvedValue(
        mockProjectsList,
      );

      const res = await controller.getPendingProjects('plan', 8, 1);

      expect(res).toEqual(mockProjectsList);

      expect(
        mockedProjectsService.prototype.getPendingProjects,
      ).toHaveBeenCalled();
      expect(
        mockedProjectsService.prototype.getPendingProjects,
      ).toHaveBeenCalledWith('plan', 8, 1);
    });
  });

  describe('search', () => {
    it('should return list of projects', async () => {
      const mockProjectItem: ProjectItem = {
        id: 1,
        type: 'test',
        title: 'test',
        team_name: 'test',
        fields: ['test'],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };

      mockedProjectsService.prototype.search.mockResolvedValue(
        mockProjectsList,
      );

      const res = await controller.search('test', 8, 1);

      expect(res).toEqual(mockProjectsList);

      expect(mockedProjectsService.prototype.search).toHaveBeenCalled();
      expect(mockedProjectsService.prototype.search).toHaveBeenCalledWith(
        'test',
        8,
        1,
      );
    });
  });

  describe('projectDetail', () => {
    it('should return list of projects', async () => {
      const mockProjectDetail: ProjectDetailDto = {
        project_name: 'test',
        writer: 'test',
        members: [],
      };

      mockedProjectsService.prototype.getDetail.mockResolvedValue(
        mockProjectDetail,
      );

      const res = await controller.projectDetail(1);

      expect(res).toEqual(mockProjectDetail);

      expect(mockedProjectsService.prototype.getDetail).toHaveBeenCalled();
      expect(mockedProjectsService.prototype.getDetail).toHaveBeenCalledWith(1);
    });
  });

  describe('confirmedProjects', () => {
    it('should return list of projects', async () => {
      const mockProjectItem: ProjectItem = {
        id: 1,
        type: 'test',
        title: 'test',
        team_name: 'test',
        fields: ['test'],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };

      mockedProjectsService.prototype.getConfirmed.mockResolvedValue(
        mockProjectsList,
      );

      const res = await controller.confirmedProjects(8, 1);

      expect(res).toEqual(mockProjectsList);

      expect(mockedProjectsService.prototype.getConfirmed).toHaveBeenCalled();
      expect(mockedProjectsService.prototype.getConfirmed).toHaveBeenCalledWith(
        8,
        1,
      );
    });
  });
});
