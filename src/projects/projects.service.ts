import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Repository } from 'typeorm';
import { ConfirmProjectDto } from './dto/request/confirmProject.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly statusService: StatusService,
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

  async getProject(id: number): Promise<Project> {
    return await this.projectsRepository.findOne(id);
  }
}
