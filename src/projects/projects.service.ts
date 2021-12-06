import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectItem } from 'src/projects/dto/response/projectItem.dto';
import {
  ConfirmProjectBodyDto,
  ConfirmProjectParamDto,
} from './dto/request/confirmProject.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { MailService } from 'src/mail/mail.service';
import { SearchProjectsDto } from './dto/request/searchProjects.dto';
import { ConfirmedProjectsDto } from './dto/request/confirmedProjects.dto';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';
import { ProjectRepository } from 'src/shared/entities/project/project.repository';
import { FieldRepository } from 'src/shared/entities/field/field.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly fieldRepository: FieldRepository,
    private readonly mailService: MailService,
  ) {}

  async confirmProject(
    paramPayload: ConfirmProjectParamDto,
    bodyPayload: ConfirmProjectBodyDto,
  ) {
    const { projectId, type } = paramPayload;
    const project = await this.projectRepository.findOne(
      { id: projectId },
      {
        status: true,
        plan: true,
        writer: true,
      },
    );
    if (!project) throw new NotFoundException();
    const status = project.status;
    switch (type) {
      case 'plan': {
        if (!status.isPlanSubmitted || status.isPlanAccepted !== null)
          throw new ConflictException();

        switch (bodyPayload.type) {
          case 'approve': {
            await this.mailService.sendMail(
              project.writer.email,
              '[RMS] 계획서 승인 알림 메일입니다.',
              'planApproved',
              {
                projectName: project.projectName,
                comment: bodyPayload.comment,
              },
            );
            await this.projectRepository.updateProjectAccepted({
              id: projectId,
              type: 'plan',
              status: true,
            });
            break;
          }
          case 'deny': {
            await this.mailService.sendMail(
              project.writer.email,
              '[RMS] 계획서 거절 알림 메일입니다.',
              'planDenied',
              {
                projectName: project.projectName,
                comment: bodyPayload.comment,
              },
            );
            await this.projectRepository.updateProjectAccepted({
              id: projectId,
              type: 'plan',
              status: false,
            });
            break;
          }
        }
        return;
      }
      case 'report': {
        if (!status.isReportSubmitted || status.isReportAccepted !== null)
          throw new ConflictException();

        switch (bodyPayload.type) {
          case 'approve': {
            await this.mailService.sendMail(
              project.writer.email,
              '[RMS] 보고서 승인 알림 메일입니다.',
              'reportApproved',
              {
                projectName: project.projectName,
                comment: bodyPayload.comment,
              },
            );
            await this.projectRepository.updateProjectAccepted({
              id: projectId,
              type: 'report',
              status: true,
            });
            break;
          }
          case 'deny': {
            await this.mailService.sendMail(
              project.writer.email,
              '[RMS] 보고서 거절 알림 메일입니다.',
              'reportDenied',
              {
                projectName: project.projectName,
                comment: bodyPayload.comment,
              },
            );
            await this.projectRepository.updateProjectAccepted({
              id: projectId,
              type: 'report',
              status: false,
            });
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
    const [projects, count] = await this.projectRepository.getProjectsByDate({
      type,
      limit,
      page,
    });
    if (!count) return;
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        project_type: p.projectType,
        is_individual: p.projectType === 'PERS',
        title: p.projectName,
        team_name: p.teamName,
        github_url: p.githubUrl,
        service_url: p.serviceUrl,
        docs_url: p.docsUrl,
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

  async search(payload: SearchProjectsDto) {
    const { query, limit, page } = payload;
    const [projects, count] = await this.projectRepository.search(
      { query, limit, page },
      { field: true },
    );
    if (!count) return;

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        project_type: p.projectType,
        is_individual: p.projectType === 'PERS',
        title: p.projectName,
        team_name: p.teamName,
        github_url: p.githubUrl,
        service_url: p.serviceUrl,
        docs_url: p.docsUrl,
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

  async getPlanDetail(projectId: number): Promise<PlanDetailDto> {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      {
        status: true,
        plan: true,
        members: true,
        field: true,
        writer: true,
      },
    );
    if (!project || !project.status.isPlanSubmitted)
      throw new NotFoundException();

    return {
      project_id: project.id,
      project_name: project.projectName,
      project_type: project.projectType,
      is_individual: project.projectType === 'PERS',
      writer: project.writer.name,
      writer_number: project.writer.studentNumber,
      members: project.members.map((member) => ({
        name: member.userId.name,
        role: member.role,
      })),
      fields: project.projectField.map(
        (projectField) => projectField.fieldId.field,
      ),
      plan: {
        goal: project.plan.goal,
        content: project.plan.content,
        start_date: project.plan.startDate,
        end_date: project.plan.endDate,
        includes: {
          result_report: project.plan.includeResultReport,
          code: project.plan.includeCode,
          outcome: project.plan.includeOutcome,
          others: Boolean(project.plan.includeOthers)
            ? project.plan.includeOthers
            : false,
        },
      },
    };
  }

  async getReportDetail(projectId: number): Promise<ReportDetailDto> {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      {
        status: true,
        report: true,
        members: true,
        field: true,
        writer: true,
      },
    );
    if (!project || !project.status.isReportSubmitted)
      throw new NotFoundException();

    return {
      project_id: project.id,
      project_name: project.projectName,
      project_type: project.projectType,
      is_individual: project.projectType === 'PERS',
      writer: project.writer.name,
      writer_number: project.writer.studentNumber,
      members: project.members.map((member) => ({
        name: member.userId.name,
        role: member.role,
      })),
      fields: project.projectField.map(
        (projectField) => projectField.fieldId.field,
      ),
      report: {
        content: project.report.content,
      },
    };
  }

  async getConfirmed(payload: ConfirmedProjectsDto) {
    const { limit, page, field } = payload;

    const [projects, count] = await this.projectRepository.getConfirmedProjects(
      {
        limit,
        page,
        fields: (
          await this.fieldRepository.getFieldsByName(field)
        )?.map((field) => {
          return field.id;
        }),
      },
    );
    if (!count) return;

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        project_type: p.projectType,
        is_individual: p.projectType === 'PERS',
        title: p.projectName,
        team_name: p.teamName,
        github_url: p.githubUrl,
        service_url: p.serviceUrl,
        docs_url: p.docsUrl,
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
}
