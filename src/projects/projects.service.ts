import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { ProjectItem } from 'src/projects/interfaces/projectItem.interface';
import { ConfirmProjectDto } from './dto/request/confirmProject.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { Project } from './entities/project.entity';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { MembersService } from 'src/shared/members/members.service';
import { ReportDetailDto } from './dto/response/reportDetail.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly membersService: MembersService,
    private readonly plansService: PlansService,
    private readonly reportsService: ReportsService,
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
          projectItem.id = project.id;
          projectItem.type = project.projectType;
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
      case 'report': {
        const status = await this.statusService.getStatusDescByReportDate(
          limit,
          page,
        );
        if (!status.length) return;
        projectsList.order_by = 'report';
        for await (const s of status) {
          const projectItem: ProjectItem = {};
          const project = s.projectId;
          projectItem.id = project.id;
          projectItem.type = project.projectType;
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
      default:
        throw new BadRequestException();
    }
  }

  async search(query: string) {
    const projects = await this.findLike(query);
    if (!projects.length) return;

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {};
      projectItem.id = p.id;
      projectItem.type = p.projectType;
      projectItem.title = p.projectName;
      projectItem.team_name = p.teamName;
      projectItem.fields = [];

      const fields = p.projectField;

      for (const field of fields) {
        projectItem.fields.push(field.fieldId.field);
      }
      projectList.push(projectItem);
    }

    return projectList;
  }

  async getDetail(projectId: number, type: string) {
    switch (type) {
      case 'plan': {
        const project = await this.getProject(projectId);
        if (!project) throw new NotFoundException();
        const plan = await this.plansService.getPlanById(projectId);
        if (!plan) return;
        const members = await this.membersService.getUsersByProject(projectId);

        const planDetail: PlanDetailDto = {
          project_name: project.projectName,
          writer: project.userId.name,
          members: members.map((member) => {
            return { name: member.userId.name, role: member.role };
          }),
          goal: plan.goal,
          content: plan.content,
          start_date: plan.startDate,
          end_date: plan.endDate,
          includes: {
            result_report: plan.includeResultReport,
            code: plan.includeCode,
            outcome: plan.includeOutcome,
            others: Boolean(plan.includeOthers),
            others_content: plan.includeOthers ? plan.includeOthers : '',
          },
        };

        return planDetail;
      }
      case 'report': {
        const project = await this.getProject(projectId);
        if (!project) throw new NotFoundException();
        const report = await this.reportsService.getReportById(projectId);
        if (!report) return;
        const members = await this.membersService.getUsersByProject(projectId);

        const reportDetail: ReportDetailDto = {
          project_name: project.projectName,
          writer: project.userId.name,
          members: members.map((member) => {
            return { name: member.userId.name, role: member.role };
          }),
          video_url: report.videoUrl,
          content: report.content,
        };

        return reportDetail;
      }
      default: {
        throw new BadRequestException();
      }
    }
  }

  async findLike(query: string) {
    return await this.projectsRepository.find({
      where: { projectName: Like(`%${query}%`) },
      relations: ['projectField', 'projectField.fieldId'],
    });
  }

  async getProject(id: number): Promise<Project> {
    return await this.projectsRepository.findOne(id, {
      relations: ['userId'],
    });
  }
}
