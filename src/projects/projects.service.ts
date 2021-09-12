import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { UsersService } from 'src/shared/users/users.service';
import { Repository } from 'typeorm';
import { ProjectItem } from 'src/projects/interfaces/project.interface';
import { ConfirmProjectDto } from './dto/request/confirmProject.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly statusService: StatusService,
    private readonly usersService: UsersService,
  ) {}

  async confirmProject(
    projectId: number,
    type: string,
    payload: ConfirmProjectDto,
    conflictCheck = true,
  ) {
    switch (type) {
      case 'plan': {
        const status = await this.statusService.getStatusById(projectId);
        if (!status) throw new NotFoundException();
        if (
          !status.isPlanSubmitted ||
          status.isPlanAccepted ||
          (status.isPlanAccepted !== null && conflictCheck)
        )
          throw new ConflictException();

        switch (payload.type) {
          case 'approve': {
            await this.statusService.updatePlanAccepted(projectId, true);
            break;
          }
          case 'deny': {
            await this.statusService.updatePlanAccepted(projectId, false);
            break;
          }
        }
        return;
      }
      case 'report': {
        const status = await this.statusService.getStatusById(projectId);
        if (!status) throw new NotFoundException();
        if (
          !status.isReportSubmitted ||
          status.isReportAccepted ||
          (status.isReportAccepted !== null && conflictCheck)
        )
          throw new ConflictException();

        switch (payload.type) {
          case 'approve': {
            await this.statusService.updateReportAccepted(projectId, true);
            break;
          }
          case 'deny': {
            await this.statusService.updateReportAccepted(projectId, false);
            break;
          }
        }
        return;
      }
      default: {
        throw new BadRequestException();
      }
    }
  }

  async getPendingProjects(type: string, limit: number, page: number) {
    const projectsList: ProjectsListDto = {};
    projectsList.projects = [];
    switch (type) {
      case 'plan': {
        const status = await this.statusService.getStatusDescByPlanDate(
          limit,
          page,
        );
        if (!status.length) return;
        projectsList.order_by = 'plan';
        for await (const s of status) {
          const projectItem: ProjectItem = {};
          const project = s.projectId;
          const writer = await this.usersService.getUserById(project.userId);
          if (writer.name === project.teamName)
            projectItem.type = '개인프로젝트';
          else projectItem.type = 'test';
          projectItem.title = project.projectName;
          projectItem.team_name = project.teamName;
          projectItem.fields = [];

          const fields = project.projectField;

          for (const field of fields) {
            projectItem.fields.push(field.fieldId.field);
          }

          projectsList.projects.push(projectItem);
        }
        return projectsList;
      }
    }
  }

  async getProject(id: number): Promise<Project> {
    return await this.projectsRepository.findOne(id);
  }
}
