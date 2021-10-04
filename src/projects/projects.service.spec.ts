import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import { ProjectsService } from './projects.service';
import { MailService } from 'src/mail/mail.service';
import { MembersService } from 'src/shared/members/members.service';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { StatusService } from 'src/shared/status/status.service';
import { Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Status } from 'src/shared/status/entities/status.entity';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { ProjectItem } from './dto/response/projectItem.dto';
import { Member } from 'src/shared/members/entities/member.entity';
import {
  PlanDetailDto,
  ProjectDetailDto,
  ReportDetailDto,
} from './dto/response/projectDetail.dto';
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

jest.mock('src/mail/mail.service');
jest.mock('src/shared/members/members.service');
jest.mock('src/shared/plans/plans.service');
jest.mock('src/shared/reports/reports.service');
jest.mock('src/shared/status/status.service');

const mockedStatusService = mocked(StatusService, true);
const mockedPlansService = mocked(PlansService, true);
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
        MailService,
        MembersService,
        PlansService,
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
      expect(res).toEqual(mockProjectsList);

      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalled();
      expect(
        mockedStatusService.prototype.getConfirmedStatus,
      ).toHaveBeenCalledWith(8, 1);
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
      ).toHaveBeenCalledWith(8, 1);
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
          projects: undefined,
          userId: undefined,
        },
        role: 'test',
      },
    ];

    it('should return a project w/o plan and report', async () => {
      projectsRepository.findOne.mockResolvedValue(mockProject);
      mockedPlansService.prototype.getConfirmedPlanById.mockResolvedValue(
        undefined,
      );
      mockedReportsService.prototype.getConfirmedReportById.mockResolvedValue(
        undefined,
      );
      mockedMembersService.prototype.getUsersByProject.mockResolvedValue(
        mockMembers,
      );

      const res = await service.getDetail(1);

      const mockResult: ProjectDetailDto = {
        project_name: 'test',
        writer: 'test',
        members: [{ name: 'test', role: 'test' }],
      };
      expect(res).toEqual(mockResult);

      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalled();
      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalled();
      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalled();
      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalledWith(1);
    });
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
      projectsRepository.findOne.mockResolvedValue(mockProject);
      mockedPlansService.prototype.getConfirmedPlanById.mockResolvedValue(
        mockPlan,
      );
      mockedReportsService.prototype.getConfirmedReportById.mockResolvedValue(
        undefined,
      );
      mockedMembersService.prototype.getUsersByProject.mockResolvedValue(
        mockMembers,
      );

      const res = await service.getDetail(1);

      const mockPlanResult: PlanDetailDto = {
        goal: 'test',
        content: 'test',
        start_date: '2021.09',
        end_date: '2021.09',
        includes: {
          result_report: true,
          code: true,
          outcome: true,
          others: false,
          others_content: '',
        },
      };

      const mockResult: ProjectDetailDto = {
        project_name: 'test',
        writer: 'test',
        members: [{ name: 'test', role: 'test' }],
        plan: mockPlanResult,
      };
      expect(res).toEqual(mockResult);

      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalled();
      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalled();
      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalled();
      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalledWith(1);
    });

    it('should return a project w/ report', async () => {
      const mockReport: Report = {
        projectId: mockProject,
        videoUrl: 'http://example.com',
        content: 'test',
      };
      projectsRepository.findOne.mockResolvedValue(mockProject);
      mockedPlansService.prototype.getConfirmedPlanById.mockResolvedValue(
        undefined,
      );
      mockedReportsService.prototype.getConfirmedReportById.mockResolvedValue(
        mockReport,
      );
      mockedMembersService.prototype.getUsersByProject.mockResolvedValue(
        mockMembers,
      );

      const res = await service.getDetail(1);

      const mockReportResult: ReportDetailDto = {
        video_url: 'http://example.com',
        content: 'test',
      };

      const mockResult: ProjectDetailDto = {
        project_name: 'test',
        writer: 'test',
        members: [{ name: 'test', role: 'test' }],
        report: mockReportResult,
      };
      expect(res).toEqual(mockResult);

      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalled();
      expect(
        mockedPlansService.prototype.getConfirmedPlanById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalled();
      expect(
        mockedReportsService.prototype.getConfirmedReportById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalled();
      expect(
        mockedMembersService.prototype.getUsersByProject,
      ).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException', async () => {
      projectsRepository.findOne.mockResolvedValue(undefined);
      try {
        await service.getDetail(1);
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
            writerName: 'test',
            projectName: 'test',
            teacher: 'test',
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
            writerName: 'test',
            projectName: 'test',
            teacher: 'test',
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
            writerName: 'test',
            projectName: 'test',
            teacher: 'test',
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
            writerName: 'test',
            projectName: 'test',
            teacher: 'test',
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
