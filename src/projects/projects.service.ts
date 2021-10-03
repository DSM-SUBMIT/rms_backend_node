import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { ProjectItem } from 'src/projects/dto/response/projectItem.dto';
import {
  ConfirmProjectBodyDto,
  ConfirmProjectParamDto,
} from './dto/request/confirmProject.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { Project } from './entities/project.entity';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { MembersService } from 'src/shared/members/members.service';
import { MailService } from 'src/mail/mail.service';
import { ProjectDetailDto } from './dto/response/projectDetail.dto';
import { SearchProjectsDto } from './dto/request/searchProjects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly mailService: MailService,
    private readonly membersService: MembersService,
    private readonly plansService: PlansService,
    private readonly reportsService: ReportsService,
    private readonly statusService: StatusService,
  ) {}

  async confirmProject(
    paramPayload: ConfirmProjectParamDto,
    bodyPayload: ConfirmProjectBodyDto,
  ) {
    const { projectId, type } = paramPayload;
    switch (type) {
      case 'plan': {
        const status = await this.statusService.getStatusById(projectId);
        if (!status) throw new NotFoundException();
        if (!status.isPlanSubmitted || status.isPlanAccepted !== null)
          throw new ConflictException();

        switch (bodyPayload.type) {
          case 'approve': {
            await this.mailService.sendMail(
              status.projectId.writerId.email,
              '[RMS] 계획서 승인 알림 메일입니다.',
              'planApproved',
              {
                writerName: status.projectId.writerId.name,
                projectName: status.projectId.projectName,
                teacher: status.projectId.teacher,
                comment: bodyPayload.comment,
              },
            );
            await this.statusService.updatePlanAccepted(projectId, true);
            break;
          }
          case 'deny': {
            await this.mailService.sendMail(
              status.projectId.writerId.email,
              '[RMS] 계획서 거절 알림 메일입니다.',
              'planDenied',
              {
                writerName: status.projectId.writerId.name,
                projectName: status.projectId.projectName,
                teacher: status.projectId.teacher,
                comment: bodyPayload.comment,
              },
            );
            await this.statusService.updatePlanAccepted(projectId, false);
            break;
          }
        }
        return;
      }
      case 'report': {
        const status = await this.statusService.getStatusById(projectId);
        if (!status) throw new NotFoundException();
        if (!status.isReportSubmitted || status.isReportAccepted !== null)
          throw new ConflictException();

        switch (bodyPayload.type) {
          case 'approve': {
            await this.mailService.sendMail(
              status.projectId.writerId.email,
              '[RMS] 보고서 승인 알림 메일입니다.',
              'reportApproved',
              {
                writerName: status.projectId.writerId.name,
                projectName: status.projectId.projectName,
                teacher: status.projectId.teacher,
                comment: bodyPayload.comment,
              },
            );
            await this.statusService.updateReportAccepted(projectId, true);
            break;
          }
          case 'deny': {
            await this.mailService.sendMail(
              status.projectId.writerId.email,
              '[RMS] 보고서 거절 알림 메일입니다.',
              'reportDenied',
              {
                writerName: status.projectId.writerId.name,
                projectName: status.projectId.projectName,
                teacher: status.projectId.teacher,
                comment: bodyPayload.comment,
              },
            );
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

  async getPendingProjects(payload) {
    const { type, limit, page } = payload;
    const projectList = new Array<ProjectItem>();
    switch (type) {
      case 'plan': {
        const [status, count] =
          await this.statusService.getStatusDescByPlanDate(limit, page);
        if (!count) return;
        for await (const s of status) {
          const project = s.projectId;
          const projectItem: ProjectItem = {
            id: project.id,
            type: project.projectType,
            title: project.projectName,
            team_name: project.teamName,
            fields: [],
          };

          const fields = project.projectField;

          for (const field of fields) {
            projectItem.fields.push(field.fieldId.field);
          }

          projectList.push(projectItem);
        }
        const projectsList: ProjectsListDto = {
          total_page: Math.ceil(count / limit),
          total_amount: count,
          projects: projectList,
        };
        return projectsList;
      }
      case 'report': {
        const [status, count] =
          await this.statusService.getStatusDescByReportDate(limit, page);
        if (!count) return;
        for await (const s of status) {
          const project = s.projectId;
          const projectItem: ProjectItem = {
            id: project.id,
            type: project.projectType,
            title: project.projectName,
            team_name: project.teamName,
            fields: [],
          };

          const fields = project.projectField;

          for (const field of fields) {
            projectItem.fields.push(field.fieldId.field);
          }

          projectList.push(projectItem);
        }
        const projectsList: ProjectsListDto = {
          total_page: Math.ceil(count / limit),
          total_amount: count,
          projects: projectList,
        };
        return projectsList;
      }
      default:
        throw new BadRequestException();
    }
  }

  async search(payload: SearchProjectsDto) {
    const { query, limit, page } = payload;
    const [projects, count] = await this.findLike(query, limit, page);
    if (!count) return;

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        type: p.projectType,
        title: p.projectName,
        team_name: p.teamName,
        fields: [],
      };

      const fields = p.projectField;

      for (const field of fields) {
        projectItem.fields.push(field.fieldId.field);
      }
      projectList.push(projectItem);
    }

    const response: ProjectsListDto = {
      total_page: Math.ceil(count / limit),
      total_amount: count,
      projects: projectList,
    };

    return response;
  }

  async getDetail(projectId: number) {
    const project = await this.getProject(projectId);
    if (!project) throw new NotFoundException();
    const plan = await this.plansService.getConfirmedPlanById(projectId);
    const report = await this.reportsService.getConfirmedReportById(projectId);
    const members = await this.membersService.getUsersByProject(projectId);
    const projectDetail: ProjectDetailDto = {
      project_name: project.projectName,
      writer: project.writerId.name,
      members: members.map((member) => {
        return { name: member.userId.name, role: member.role };
      }),
    };

    if (plan) {
      projectDetail.plan = {
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
    }
    if (report) {
      projectDetail.report = {
        video_url: report.videoUrl,
        content: report.content,
      };
    }
    return projectDetail;
  }

  async getConfirmed(limit: number, page: number) {
    const [status, count] = await this.statusService.getConfirmedStatus(
      limit,
      page,
    );
    if (!count) return;

    const projects = status.map((s) => {
      return s.projectId;
    });

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        type: p.projectType,
        title: p.projectName,
        team_name: p.teamName,
        fields: [],
      };

      const fields = p.projectField;

      for (const field of fields) {
        projectItem.fields.push(field.fieldId.field);
      }
      projectList.push(projectItem);
    }
    const projectsList: ProjectsListDto = {
      total_page: Math.ceil(count / limit),
      total_amount: count,
      projects: projectList,
    };

    return projectsList;
  }

  async findLike(query: string, limit: number, page: number) {
    return await this.projectsRepository.findAndCount({
      where: { projectName: Like(`%${query}%`) },
      take: limit,
      skip: limit * (page - 1),
      relations: ['projectField', 'projectField.fieldId'],
    });
  }

  async getProject(id: number): Promise<Project> {
    return await this.projectsRepository.findOne(id, {
      relations: ['writerId'],
    });
  }
}
