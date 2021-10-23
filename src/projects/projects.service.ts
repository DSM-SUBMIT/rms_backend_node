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
import { SearchProjectsDto } from './dto/request/searchProjects.dto';
import { ConfirmedProjectsDto } from './dto/request/confirmedProjects.dto';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';
import { ProjectFieldService } from 'src/shared/projectField/projectField.service';
import { FieldsService } from 'src/shared/fields/fields.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly fieldsService: FieldsService,
    private readonly mailService: MailService,
    private readonly membersService: MembersService,
    private readonly plansService: PlansService,
    private readonly projectFieldService: ProjectFieldService,
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
                projectName: status.projectId.projectName,
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
                projectName: status.projectId.projectName,
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
                projectName: status.projectId.projectName,
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
                projectName: status.projectId.projectName,
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
        for (const s of status) {
          const project = s.projectId;
          const projectItem: ProjectItem = {
            id: project.id,
            project_type: project.projectType,
            is_individual: project.projectType === 'PERS',
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
        for (const s of status) {
          const project = s.projectId;
          const projectItem: ProjectItem = {
            id: project.id,
            project_type: project.projectType,
            is_individual: project.projectType === 'PERS',
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
        project_type: p.projectType,
        is_individual: p.projectType === 'PERS',
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

  async getPlanDetail(projectId: number): Promise<PlanDetailDto> {
    const status = await this.statusService.getStatusById(projectId);
    if (!status || !status.isPlanSubmitted) throw new NotFoundException();

    const res = await Promise.all([
      this.plansService.getPlanById(projectId),
      this.membersService.getUsersByProject(projectId),
      this.projectFieldService.getFieldsByProject(projectId),
    ]);

    const plan = res[0];
    const members = res[1];
    const fields = res[2];

    return {
      project_id: status.projectId.id,
      project_name: status.projectId.projectName,
      project_type: status.projectId.projectType,
      is_individual: status.projectId.projectType === 'PERS',
      writer: status.projectId.writerId.name,
      writer_number: status.projectId.writerId.studentNumber,
      members: members.map((member) => ({
        name: member.userId.name,
        role: member.role,
      })),
      fields: fields.map((field) => field.fieldId.field),
      plan: {
        goal: plan.goal,
        content: plan.content,
        start_date: plan.startDate,
        end_date: plan.endDate,
        includes: {
          result_report: plan.includeResultReport,
          code: plan.includeCode,
          outcome: plan.includeOutcome,
          others: Boolean(plan.includeOthers) ? plan.includeOthers : false,
        },
      },
    };
  }

  async getReportDetail(projectId: number): Promise<ReportDetailDto> {
    const status = await this.statusService.getStatusById(projectId);
    if (!status || !status.isReportSubmitted) throw new NotFoundException();

    const res = await Promise.all([
      this.reportsService.getReportById(projectId),
      this.membersService.getUsersByProject(projectId),
      this.projectFieldService.getFieldsByProject(projectId),
    ]);

    const report = res[0];
    const members = res[1];
    const fields = res[2];

    return {
      project_id: status.projectId.id,
      project_name: status.projectId.projectName,
      project_type: status.projectId.projectType,
      is_individual: status.projectId.projectType === 'PERS',
      writer: status.projectId.writerId.name,
      writer_number: status.projectId.writerId.studentNumber,
      members: members.map((member) => ({
        name: member.userId.name,
        role: member.role,
      })),
      fields: fields.map((field) => field.fieldId.field),
      report: {
        content: report.content,
      },
    };
  }

  async getConfirmed(payload: ConfirmedProjectsDto) {
    console.log(typeof payload.field);
    console.log(payload.field);
    const { limit, page, field } = payload;
    const matchedProject = field
      ? await this.projectFieldService.getProjectsByField(
          await this.fieldsService.getIdsByField(field),
          limit,
          page,
        )
      : undefined;

    console.log(matchedProject);

    const [status, count] = await this.statusService.getConfirmedStatus(
      limit,
      page,
      matchedProject,
    );
    if (!count) return;

    const projects = status.map((s) => {
      return s.projectId;
    });

    const projectList = new Array<ProjectItem>();
    for (const p of projects) {
      const projectItem: ProjectItem = {
        id: p.id,
        project_type: p.projectType,
        is_individual: p.projectType === 'PERS',
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
    return this.projectsRepository.findAndCount({
      where: { projectName: Like(`%${query}%`) },
      take: limit,
      skip: limit * (page - 1),
      relations: ['projectField', 'projectField.fieldId'],
    });
  }

  async getProject(id: number): Promise<Project> {
    return this.projectsRepository.findOne(id, {
      relations: ['writerId'],
    });
  }
}
