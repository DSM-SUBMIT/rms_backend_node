import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import { ProjectsService } from './projects.service';
import { MailService } from 'src/mail/mail.service';
import { MembersService } from 'src/shared/members/members.service';
import { PlansService } from 'src/shared/plans/plans.service';
import { ProjectFieldService } from 'src/shared/projectField/projectField.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Status } from 'src/shared/status/entities/status.entity';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { ProjectItem } from './dto/response/projectItem.dto';
import { Member } from 'src/shared/members/entities/member.entity';
import { Plan } from 'src/shared/plans/entities/plan.entity';
import { Report } from 'src/shared/reports/entities/report.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectField } from 'src/shared/projectField/entities/projectField.entity';
import { Field } from 'src/shared/fields/entities/field.entity';
import {
  ConfirmProjectBodyDto,
  ConfirmProjectParamDto,
} from './dto/request/confirmProject.dto';
import { ConfirmedProjectsDto } from './dto/request/confirmedProjects.dto';
import { SearchProjectsDto } from './dto/request/searchProjects.dto';
import { PendingProjectsDto } from './dto/request/pendingProjects.dto';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';
import { FieldsService } from 'src/shared/fields/fields.service';

jest.mock('src/shared/fields/fields.service');
jest.mock('src/mail/mail.service');
jest.mock('src/shared/members/members.service');
jest.mock('src/shared/plans/plans.service');
jest.mock('src/shared/projectField/projectField.service');
jest.mock('src/shared/reports/reports.service');
jest.mock('src/shared/status/status.service');

const mockedFieldsService = mocked(FieldsService, true);
const mockedStatusService = mocked(StatusService, true);
const mockedPlansService = mocked(PlansService, true);
const mockedProjectFieldService = mocked(ProjectFieldService, true);
const mockedReportsService = mocked(ReportsService, true);
const mockedMembersService = mocked(MembersService, true);
const mockedMailService = mocked(MailService, true);

const mockedRepository = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: MockRepository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockedRepository(),
        },
        FieldsService,
        MailService,
        MembersService,
        PlansService,
        ProjectFieldService,
        ReportsService,
        StatusService,
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectsRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProject', () => {
    it('should return a project', async () => {
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          studentNumber: 2400,
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: undefined,
        projectField: undefined,
      };
      projectsRepository.findOne.mockResolvedValue(mockProject);
      const res = await service.getProject(1);

      expect(res).toEqual(mockProject);

      expect(projectsRepository.findOne).toHaveBeenCalled();
      expect(projectsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['writerId'],
      });
    });
  });

  describe('findLike', () => {
    it('should return a project', async () => {
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          studentNumber: 2400,
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: undefined,
        projectField: undefined,
      };
      projectsRepository.findAndCount.mockResolvedValue([[mockProject], 1]);
      const res = await service.findLike('test', 8, 1);

      expect(res).toEqual([[mockProject], 1]);

      expect(projectsRepository.findAndCount).toHaveBeenCalled();
      expect(projectsRepository.findAndCount).toHaveBeenCalledWith({
        where: { projectName: Like('%test%') },
        take: 8,
        skip: 0,
        relations: ['projectField', 'projectField.fieldId'],
      });
    });
  });

  describe('getConfirmed', () => {
    it('should return confirmed projects', async () => {
      const mockField: Field = {
        id: 1,
        field: 'test',
        projectField: undefined,
      };
      const mockFields: ProjectField[] = [
        {
          fieldId: mockField,
          projectId: undefined,
        },
      ];
      const mockProject: Project = {
        id: 1,
        projectName: 'test',
        teamName: 'test',
        techStacks: 'test',
        writerId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          studentNumber: 2400,
          projects: undefined,
          userId: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        projectId: [],
        projectField: mockFields,
      };
      const mockStatus: Status = {
        projectId: mockProject,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
        reportSubmittedAt: new Date('2021-09-20T00:00:00'),
        isPlanAccepted: true,
        isReportAccepted: true,
      };
      mockedStatusService.prototype.getConfirmedStatus.mockResolvedValue([
        [mockStatus],
        1,
      ]);

      const mockedRequest: ConfirmedProjectsDto = {
        limit: 8,
        page: 1,
      };

      const res = await service.getConfirmed(mockedRequest);

      const mockProjectItem: ProjectItem = {
        id: 1,
        project_type: 'test',
        is_individual: false,
        title: 'test',
        team_name: 'test',
        github_url: null,
        service_url: null,
        docs_url: null,
        fields: ['test'],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };
      expect(res).toEqual(mockProjectsList);

      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalled();
      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalledWith(8, 1, undefined);
    });

    it('should return nothing', async () => {
      mockedStatusService.prototype.getConfirmedStatus.mockResolvedValue([
        [],
        0,
      ]);

      const mockedRequest: ConfirmedProjectsDto = {
        limit: 8,
        page: 1,
      };

      const res = await service.getConfirmed(mockedRequest);

      expect(res).toEqual(undefined);

      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalled();
      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalledWith(8, 1, undefined);
    });
  });

  describe('getDetail', () => {
    const mockProject: Project = {
      id: 1,
      projectName: 'test',
      teamName: 'test',
      techStacks: 'test',
      writerId: {
        id: 1,
        email: 'test@example.com',
        name: 'test',
        studentNumber: 2400,
        projects: undefined,
        userId: undefined,
      },
      projectType: 'test',
      githubUrl: null,
      serviceUrl: null,
      docsUrl: null,
      teacher: 'test',
      projectId: undefined,
      projectField: undefined,
    };

    const mockMembers: Member[] = [
      {
        projectId: mockProject,
        userId: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          studentNumber: 2400,
          projects: undefined,
          userId: undefined,
        },
        role: 'test',
      },
    ];

    const mockProjectField: ProjectField[] = [
      {
        fieldId: {
          id: 1,
          field: 'test',
          projectField: undefined,
        },
        projectId: mockProject,
      },
    ];

    const mockStatus: Status = {
      projectId: mockProject,
      isPlanSubmitted: true,
      isReportSubmitted: true,
      planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
      reportSubmittedAt: new Date('2021-09-20T00:00:00'),
      isPlanAccepted: true,
      isReportAccepted: true,
    };

    mockedStatusService.prototype.getStatusById.mockResolvedValue(mockStatus);

    mockedMembersService.prototype.getUsersByProject.mockResolvedValue(
      mockMembers,
    );
    mockedProjectFieldService.prototype.getFieldsByProject.mockResolvedValue(
      mockProjectField,
    );

    it('should return a project w/ plan', async () => {
      const mockPlan: Plan = {
        projectId: mockProject,
        goal: 'test',
        content: 'test',
        startDate: '2021.09',
        endDate: '2021.09',
        includeResultReport: true,
        includeCode: true,
        includeOutcome: true,
        includeOthers: null,
      };
      mockedPlansService.prototype.getPlanById.mockResolvedValue(mockPlan);

      const res = await service.getPlanDetail(1);

      const mockPlanResult: PlanDetailDto = {
        project_id: 1,
        project_name: 'test',
        project_type: 'test',
        is_individual: false,
        writer: 'test',
        writer_number: 2400,
        members: [{ name: 'test', role: 'test' }],
        fields: ['test'],
        plan: {
          goal: 'test',
          content: 'test',
          start_date: '2021.09',
          end_date: '2021.09',
          includes: {
            result_report: true,
            code: true,
            outcome: true,
            others: false,
          },
        },
      };
      expect(res).toEqual(mockPlanResult);

      expect(mockedPlansService.prototype.getPlanById).toHaveBeenCalled();
      expect(mockedPlansService.prototype.getPlanById).toHaveBeenCalledWith(1);

      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalled();
      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedProjectFieldService.prototype.getFieldsByProject,
      ).toHaveBeenCalled();
      expect(
        mockedProjectFieldService.prototype.getFieldsByProject,
      ).toHaveBeenCalledWith(1);
    });

    it('should return a project w/ report', async () => {
      const mockReport: Report = {
        projectId: mockProject,
        videoUrl: 'http://example.com',
        content: 'test',
      };
      mockedReportsService.prototype.getReportById.mockResolvedValue(
        mockReport,
      );

      const res = await service.getReportDetail(1);

      const mockReportResult: ReportDetailDto = {
        project_id: 1,
        project_name: 'test',
        project_type: 'test',
        is_individual: false,
        writer: 'test',
        writer_number: 2400,
        members: [{ name: 'test', role: 'test' }],
        fields: ['test'],
        report: {
          content: 'test',
        },
      };

      expect(res).toEqual(mockReportResult);

      expect(mockedReportsService.prototype.getReportById).toHaveBeenCalled();
      expect(mockedReportsService.prototype.getReportById).toHaveBeenCalledWith(
        1,
      );

      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalled();
      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedProjectFieldService.prototype.getFieldsByProject,
      ).toHaveBeenCalled();
      expect(
        mockedProjectFieldService.prototype.getFieldsByProject,
      ).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException(project is not exsist)', async () => {
      mockedStatusService.prototype.getStatusById.mockResolvedValue(undefined);
      try {
        await service.getPlanDetail(1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw NotFoundException(plan is not submitted)', async () => {
      const mockStatus: Status = {
        projectId: mockProject,
        isPlanSubmitted: false,
        isReportSubmitted: false,
        planSubmittedAt: null,
        reportSubmittedAt: null,
        isPlanAccepted: null,
        isReportAccepted: null,
      };
      mockedStatusService.prototype.getStatusById.mockResolvedValue(mockStatus);
      try {
        await service.getPlanDetail(1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw NotFoundException(report is not submitted)', async () => {
      const mockStatus: Status = {
        projectId: mockProject,
        isPlanSubmitted: false,
        isReportSubmitted: false,
        planSubmittedAt: null,
        reportSubmittedAt: null,
        isPlanAccepted: null,
        isReportAccepted: null,
      };
      mockedStatusService.prototype.getStatusById.mockResolvedValue(mockStatus);
      try {
        await service.getReportDetail(1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('search', () => {
    const mockField: Field = {
      id: 1,
      field: 'test',
      projectField: undefined,
    };
    const mockFields: ProjectField[] = [
      {
        fieldId: mockField,
        projectId: undefined,
      },
    ];
    const mockProject: Project = {
      id: 1,
      projectName: 'test',
      teamName: 'test',
      techStacks: 'test',
      writerId: {
        id: 1,
        email: 'test@example.com',
        name: 'test',
        studentNumber: 2400,
        projects: undefined,
        userId: undefined,
      },
      projectType: 'test',
      githubUrl: null,
      serviceUrl: null,
      docsUrl: null,
      teacher: 'test',
      projectId: undefined,
      projectField: mockFields,
    };
    it('should return a project', async () => {
      projectsRepository.findAndCount.mockResolvedValue([[mockProject], 1]);

      const mockProjectItem: ProjectItem = {
        id: 1,
        project_type: 'test',
        is_individual: false,
        title: 'test',
        team_name: 'test',
        github_url: null,
        service_url: null,
        docs_url: null,
        fields: ['test'],
      };
      const mockProjectsList: ProjectsListDto = {
        total_page: 1,
        total_amount: 1,
        projects: [mockProjectItem],
      };

      const mockedRequest: SearchProjectsDto = {
        query: 'test',
        limit: 8,
        page: 1,
      };

      const res = await service.search(mockedRequest);

      expect(res).toEqual(mockProjectsList);

      expect(projectsRepository.findAndCount).toHaveBeenCalled();
      expect(projectsRepository.findAndCount).toHaveBeenCalledWith({
        where: { projectName: Like('%test%') },
        take: 8,
        skip: 8 * (1 - 1),
        relations: ['projectField', 'projectField.fieldId'],
      });
    });
    it('should return nothing', async () => {
      projectsRepository.findAndCount.mockResolvedValue([[], 0]);

      const mockedRequest: SearchProjectsDto = {
        query: 'test',
        limit: 8,
        page: 1,
      };

      const res = await service.search(mockedRequest);

      expect(res).toEqual(undefined);

      expect(projectsRepository.findAndCount).toHaveBeenCalled();
      expect(projectsRepository.findAndCount).toHaveBeenCalledWith({
        where: { projectName: Like('%test%') },
        take: 8,
        skip: 8 * (1 - 1),
        relations: ['projectField', 'projectField.fieldId'],
      });
    });
  });

  describe('getPendingProjects', () => {
    describe('plan', () => {
      it('should return a list of pending plans', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: true,
          isReportAccepted: true,
        };
        mockedStatusService.prototype.getStatusDescByPlanDate.mockResolvedValue(
          [[mockStatus], 1],
        );

        const mockedRequest: PendingProjectsDto = {
          type: 'plan',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        const mockProjectItem: ProjectItem = {
          id: 1,
          project_type: 'test',
          is_individual: false,
          title: 'test',
          team_name: 'test',
          github_url: null,
          service_url: null,
          docs_url: null,
          fields: ['test'],
        };
        const mockProjectsList: ProjectsListDto = {
          total_page: 1,
          total_amount: 1,
          projects: [mockProjectItem],
        };

        expect(res).toEqual(mockProjectsList);

        expect(
          mockedStatusService.prototype.getStatusDescByPlanDate,
        ).toHaveBeenCalled();
        expect(
          mockedStatusService.prototype.getStatusDescByPlanDate,
        ).toHaveBeenCalledWith(8, 1);
      });
      it('should return nothing', async () => {
        mockedStatusService.prototype.getStatusDescByPlanDate.mockResolvedValue(
          [[], 0],
        );

        const mockedRequest: PendingProjectsDto = {
          type: 'plan',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        expect(res).toEqual(undefined);

        expect(
          mockedStatusService.prototype.getStatusDescByPlanDate,
        ).toHaveBeenCalled();
        expect(
          mockedStatusService.prototype.getStatusDescByPlanDate,
        ).toHaveBeenCalledWith(8, 1);
      });
    });
    describe('report', () => {
      it('should return a list of pending reports', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: true,
          isReportAccepted: true,
        };
        mockedStatusService.prototype.getStatusDescByReportDate.mockResolvedValue(
          [[mockStatus], 1],
        );

        const mockedRequest: PendingProjectsDto = {
          type: 'report',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        const mockProjectItem: ProjectItem = {
          id: 1,
          project_type: 'test',
          is_individual: false,
          title: 'test',
          team_name: 'test',
          github_url: null,
          service_url: null,
          docs_url: null,
          fields: ['test'],
        };
        const mockProjectsList: ProjectsListDto = {
          total_page: 1,
          total_amount: 1,
          projects: [mockProjectItem],
        };

        expect(res).toEqual(mockProjectsList);

        expect(
          mockedStatusService.prototype.getStatusDescByReportDate,
        ).toHaveBeenCalled();
        expect(
          mockedStatusService.prototype.getStatusDescByReportDate,
        ).toHaveBeenCalledWith(8, 1);
      });
      it('should return nothing', async () => {
        mockedStatusService.prototype.getStatusDescByReportDate.mockResolvedValue(
          [[], 0],
        );

        const mockedRequest: PendingProjectsDto = {
          type: 'report',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        expect(res).toEqual(undefined);

        expect(
          mockedStatusService.prototype.getStatusDescByReportDate,
        ).toHaveBeenCalled();
        expect(
          mockedStatusService.prototype.getStatusDescByReportDate,
        ).toHaveBeenCalledWith(8, 1);
      });
    });

    it('should throw BadRequestException', async () => {
      const mockedRequest: PendingProjectsDto = {
        type: 'invalid',
        limit: 8,
        page: 1,
      };
      try {
        await service.getPendingProjects(mockedRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('confirmProject', () => {
    describe('plan', () => {
      it('should approve project and return nothing', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: null,
          isReportAccepted: null,
        };
        mockedStatusService.prototype.getStatusById.mockResolvedValue(
          mockStatus,
        );
        const mockConfirmRequestBody: ConfirmProjectBodyDto = {
          type: 'approve',
          comment: 'test',
        };
        const mockConfirmRequestParam: ConfirmProjectParamDto = {
          projectId: 1,
          type: 'plan',
        };
        const res = await service.confirmProject(
          mockConfirmRequestParam,
          mockConfirmRequestBody,
        );

        expect(res).toEqual(undefined);

        expect(mockedMailService.prototype.sendMail).toHaveBeenCalled();
        expect(mockedMailService.prototype.sendMail).toHaveBeenCalledWith(
          'test@example.com',
          '[RMS] 계획서 승인 알림 메일입니다.',
          'planApproved',
          {
            projectName: 'test',
            comment: 'test',
          },
        );
      });
      it('should deny project and return nothing', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: null,
          isReportAccepted: null,
        };
        mockedStatusService.prototype.getStatusById.mockResolvedValue(
          mockStatus,
        );
        const mockConfirmRequestBody: ConfirmProjectBodyDto = {
          type: 'deny',
          comment: 'test',
        };
        const mockConfirmRequestParam: ConfirmProjectParamDto = {
          projectId: 1,
          type: 'plan',
        };
        const res = await service.confirmProject(
          mockConfirmRequestParam,
          mockConfirmRequestBody,
        );

        expect(res).toEqual(undefined);

        expect(mockedMailService.prototype.sendMail).toHaveBeenCalled();
        expect(mockedMailService.prototype.sendMail).toHaveBeenCalledWith(
          'test@example.com',
          '[RMS] 계획서 거절 알림 메일입니다.',
          'planDenied',
          {
            projectName: 'test',
            comment: 'test',
          },
        );
      });
      describe('should throw exception', () => {
        it('NotFoundException', async () => {
          mockedStatusService.prototype.getStatusById.mockResolvedValue(
            undefined,
          );
          const mockConfirmRequestBody: ConfirmProjectBodyDto = {
            type: 'approve',
            comment: 'test',
          };
          const mockConfirmRequestParam: ConfirmProjectParamDto = {
            projectId: 1,
            type: 'plan',
          };
          try {
            await service.confirmProject(
              mockConfirmRequestParam,
              mockConfirmRequestBody,
            );
          } catch (e) {
            expect(e).toBeInstanceOf(NotFoundException);
          }
        });
        describe('ConflictException', () => {
          it('plan is not submitted', async () => {
            const mockStatus: Status = {
              projectId: undefined,
              isPlanSubmitted: false,
              isReportSubmitted: false,
              planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
              reportSubmittedAt: new Date('2021-09-20T00:00:00'),
              isPlanAccepted: null,
              isReportAccepted: null,
            };
            const mockConfirmRequest: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'plan',
            };
            mockedStatusService.prototype.getStatusById.mockResolvedValue(
              mockStatus,
            );
            try {
              await service.confirmProject(
                mockConfirmRequestParam,
                mockConfirmRequest,
              );
            } catch (e) {
              expect(e).toBeInstanceOf(ConflictException);
            }
          });
          it('plan is already confirmed', async () => {
            const mockStatus: Status = {
              projectId: undefined,
              isPlanSubmitted: true,
              isReportSubmitted: true,
              planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
              reportSubmittedAt: new Date('2021-09-20T00:00:00'),
              isPlanAccepted: true,
              isReportAccepted: false,
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'plan',
            };
            mockedStatusService.prototype.getStatusById.mockResolvedValue(
              mockStatus,
            );
            try {
              await service.confirmProject(
                mockConfirmRequestParam,
                mockConfirmRequestBody,
              );
            } catch (e) {
              expect(e).toBeInstanceOf(ConflictException);
            }
          });
        });
      });
    });
    describe('report', () => {
      it('should approve project and return nothing', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: null,
          isReportAccepted: null,
        };
        mockedStatusService.prototype.getStatusById.mockResolvedValue(
          mockStatus,
        );
        const mockConfirmRequestBody: ConfirmProjectBodyDto = {
          type: 'approve',
          comment: 'test',
        };
        const mockConfirmRequestParam: ConfirmProjectParamDto = {
          projectId: 1,
          type: 'report',
        };
        const res = await service.confirmProject(
          mockConfirmRequestParam,
          mockConfirmRequestBody,
        );

        expect(res).toEqual(undefined);

        expect(mockedMailService.prototype.sendMail).toHaveBeenCalled();
        expect(mockedMailService.prototype.sendMail).toHaveBeenCalledWith(
          'test@example.com',
          '[RMS] 보고서 승인 알림 메일입니다.',
          'reportApproved',
          {
            projectName: 'test',
            comment: 'test',
          },
        );
      });
      it('should deny project and return nothing', async () => {
        const mockField: Field = {
          id: 1,
          field: 'test',
          projectField: undefined,
        };
        const mockFields: ProjectField[] = [
          {
            fieldId: mockField,
            projectId: undefined,
          },
        ];
        const mockProject: Project = {
          id: 1,
          projectName: 'test',
          teamName: 'test',
          techStacks: 'test',
          writerId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            userId: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          projectId: undefined,
          projectField: mockFields,
        };
        const mockStatus: Status = {
          projectId: mockProject,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: null,
          isReportAccepted: null,
        };
        mockedStatusService.prototype.getStatusById.mockResolvedValue(
          mockStatus,
        );
        const mockConfirmRequestBody: ConfirmProjectBodyDto = {
          type: 'deny',
          comment: 'test',
        };
        const mockConfirmRequestParam: ConfirmProjectParamDto = {
          projectId: 1,
          type: 'report',
        };
        const res = await service.confirmProject(
          mockConfirmRequestParam,
          mockConfirmRequestBody,
        );

        expect(res).toEqual(undefined);

        expect(mockedMailService.prototype.sendMail).toHaveBeenCalled();
        expect(mockedMailService.prototype.sendMail).toHaveBeenCalledWith(
          'test@example.com',
          '[RMS] 보고서 거절 알림 메일입니다.',
          'reportDenied',
          {
            projectName: 'test',
            comment: 'test',
          },
        );
      });
      describe('should throw exception', () => {
        it('NotFoundException', async () => {
          mockedStatusService.prototype.getStatusById.mockResolvedValue(
            undefined,
          );
          const mockConfirmRequestBody: ConfirmProjectBodyDto = {
            type: 'approve',
            comment: 'test',
          };
          const mockConfirmRequestParam: ConfirmProjectParamDto = {
            projectId: 1,
            type: 'report',
          };
          try {
            await service.confirmProject(
              mockConfirmRequestParam,
              mockConfirmRequestBody,
            );
          } catch (e) {
            expect(e).toBeInstanceOf(NotFoundException);
          }
        });
        describe('ConflictException', () => {
          it('report is not submitted', async () => {
            const mockStatus: Status = {
              projectId: undefined,
              isPlanSubmitted: false,
              isReportSubmitted: false,
              planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
              reportSubmittedAt: new Date('2021-09-20T00:00:00'),
              isPlanAccepted: null,
              isReportAccepted: null,
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'report',
            };
            mockedStatusService.prototype.getStatusById.mockResolvedValue(
              mockStatus,
            );
            try {
              await service.confirmProject(
                mockConfirmRequestParam,
                mockConfirmRequestBody,
              );
            } catch (e) {
              expect(e).toBeInstanceOf(ConflictException);
            }
          });
          it('report is already confirmed', async () => {
            const mockStatus: Status = {
              projectId: undefined,
              isPlanSubmitted: true,
              isReportSubmitted: true,
              planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
              reportSubmittedAt: new Date('2021-09-20T00:00:00'),
              isPlanAccepted: true,
              isReportAccepted: false,
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'report',
            };
            mockedStatusService.prototype.getStatusById.mockResolvedValue(
              mockStatus,
            );
            try {
              await service.confirmProject(
                mockConfirmRequestParam,
                mockConfirmRequestBody,
              );
            } catch (e) {
              expect(e).toBeInstanceOf(ConflictException);
            }
          });
        });
      });
    });
    it('should throw BadRequestException', async () => {
      const mockConfirmRequestBody: ConfirmProjectBodyDto = {
        type: 'approve',
        comment: 'test',
      };
      const mockConfirmRequestParam: ConfirmProjectParamDto = {
        projectId: 1,
        type: 'error',
      };
      try {
        await service.confirmProject(
          mockConfirmRequestParam,
          mockConfirmRequestBody,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
