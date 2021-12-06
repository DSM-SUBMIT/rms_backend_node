import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import { ProjectsService } from './projects.service';
import { MailService } from 'src/mail/mail.service';
import { Project } from 'src/shared/entities/project/project.entity';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { ProjectItem } from './dto/response/projectItem.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectField } from 'src/shared/entities/projectField/projectField.entity';
import { Field } from 'src/shared/entities/field/field.entity';
import {
  ConfirmProjectBodyDto,
  ConfirmProjectParamDto,
} from './dto/request/confirmProject.dto';
import { ConfirmedProjectsDto } from './dto/request/confirmedProjects.dto';
import { SearchProjectsDto } from './dto/request/searchProjects.dto';
import { PendingProjectsDto } from './dto/request/pendingProjects.dto';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';
import { ProjectRepository } from '../shared/entities/project/project.repository';
import { FieldRepository } from '../shared/entities/field/field.repository';

jest.mock('src/mail/mail.service');
jest.mock('src/shared/entities/project/project.repository');
jest.mock('src/shared/entities/field/field.repository');

const mockedRepository = mocked(ProjectRepository, true);
const mockedMailService = mocked(MailService, true);

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        ProjectRepository,
        FieldRepository,
        MailService,
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
        writer: {
          id: 1,
          email: 'test@example.com',
          name: 'test',
          studentNumber: 2400,
          projects: undefined,
          members: undefined,
        },
        projectType: 'test',
        githubUrl: null,
        serviceUrl: null,
        docsUrl: null,
        teacher: 'test',
        members: [],
        plan: undefined,
        report: undefined,
        status: {
          projectId: undefined,
          isPlanSubmitted: true,
          isReportSubmitted: true,
          planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
          reportSubmittedAt: new Date('2021-09-20T00:00:00'),
          isPlanAccepted: true,
          isReportAccepted: true,
        },
        projectField: mockFields,
      };

      const mockedRequest: ConfirmedProjectsDto = {
        limit: 8,
        page: 1,
      };

      mockedRepository.prototype.getConfirmedProjects.mockResolvedValue([
        [mockProject],
        1,
      ]);

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
        mockedRepository.prototype.getConfirmedProjects,
      ).toHaveBeenCalled();
      expect(
        mockedRepository.prototype.getConfirmedProjects,
      ).toHaveBeenCalledWith({ limit: 8, page: 1, fields: undefined });
    });

    it('should return nothing', async () => {
      mockedRepository.prototype.getConfirmedProjects.mockResolvedValue([
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
        mockedRepository.prototype.getConfirmedProjects,
      ).toHaveBeenCalled();
      expect(
        mockedRepository.prototype.getConfirmedProjects,
      ).toHaveBeenCalledWith({ limit: 8, page: 1, fields: undefined });
    });
  });

  describe('getDetail', () => {
    const mockProject: Project = {
      id: 1,
      projectName: 'test',
      teamName: 'test',
      techStacks: 'test',
      writer: {
        id: 1,
        email: 'test@example.com',
        name: 'test',
        studentNumber: 2400,
        projects: undefined,
        members: undefined,
      },
      projectType: 'test',
      githubUrl: null,
      serviceUrl: null,
      docsUrl: null,
      teacher: 'test',
      members: [
        {
          projectId: undefined,
          userId: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          role: 'test',
        },
      ],
      plan: undefined,
      report: undefined,
      status: {
        projectId: undefined,
        isPlanSubmitted: true,
        isReportSubmitted: true,
        planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
        reportSubmittedAt: new Date('2021-09-20T00:00:00'),
        isPlanAccepted: true,
        isReportAccepted: true,
      },
      projectField: [
        {
          fieldId: {
            id: 1,
            field: 'test',
            projectField: undefined,
          },
          projectId: undefined,
        },
      ],
    };

    it('should return a project w/ plan', async () => {
      mockProject.plan = {
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
      mockedRepository.prototype.findOne.mockResolvedValue(mockProject);

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

      expect(mockedRepository.prototype.findOne).toHaveBeenCalled();
      expect(mockedRepository.prototype.findOne).toHaveBeenCalledWith(
        { id: 1 },
        {
          writer: true,
          members: true,
          status: true,
          plan: true,
          field: true,
        },
      );
    });

    it('should return a project w/ report', async () => {
      mockProject.report = {
        projectId: undefined,
        videoUrl: 'http://example.com',
        content: 'test',
      };

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

      expect(mockedRepository.prototype.findOne).toHaveBeenCalled();
      expect(mockedRepository.prototype.findOne).toHaveBeenCalledWith(
        { id: 1 },
        {
          writer: true,
          members: true,
          status: true,
          report: true,
          field: true,
        },
      );
    });

    it('should throw NotFoundException(project is not exist)', async () => {
      mockedRepository.prototype.findOne.mockResolvedValue(undefined);
      try {
        await service.getPlanDetail(1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw NotFoundException(plan is not submitted)', async () => {
      mockProject.status = {
        projectId: mockProject,
        isPlanSubmitted: false,
        isReportSubmitted: false,
        planSubmittedAt: null,
        reportSubmittedAt: null,
        isPlanAccepted: null,
        isReportAccepted: null,
      };
      try {
        await service.getPlanDetail(1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw NotFoundException(report is not submitted)', async () => {
      mockProject.status = {
        projectId: mockProject,
        isPlanSubmitted: false,
        isReportSubmitted: false,
        planSubmittedAt: null,
        reportSubmittedAt: null,
        isPlanAccepted: null,
        isReportAccepted: null,
      };
      mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
      writer: {
        id: 1,
        email: 'test@example.com',
        name: 'test',
        studentNumber: 2400,
        projects: undefined,
        members: undefined,
      },
      projectType: 'test',
      githubUrl: null,
      serviceUrl: null,
      docsUrl: null,
      teacher: 'test',
      members: [],
      plan: undefined,
      report: undefined,
      status: undefined,
      projectField: mockFields,
    };
    it('should return a project', async () => {
      mockedRepository.prototype.search.mockResolvedValue([[mockProject], 1]);

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

      expect(mockedRepository.prototype.search).toHaveBeenCalled();
      expect(mockedRepository.prototype.search).toHaveBeenCalledWith(
        {
          query: 'test',
          limit: 8,
          page: 1,
        },
        { field: true },
      );
    });
    it('should return nothing', async () => {
      mockedRepository.prototype.search.mockResolvedValue([[], 0]);

      const mockedRequest: SearchProjectsDto = {
        query: 'test',
        limit: 8,
        page: 1,
      };

      const res = await service.search(mockedRequest);

      expect(res).toEqual(undefined);

      expect(mockedRepository.prototype.search).toHaveBeenCalled();
      expect(mockedRepository.prototype.search).toHaveBeenCalledWith(
        {
          query: 'test',
          limit: 8,
          page: 1,
        },
        { field: true },
      );
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: true,
            isReportAccepted: true,
          },
          projectField: mockFields,
        };

        mockedRepository.prototype.getProjectsByDate.mockResolvedValue([
          [mockProject],
          1,
        ]);

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

        expect(mockedRepository.prototype.getProjectsByDate).toHaveBeenCalled();
        expect(
          mockedRepository.prototype.getProjectsByDate,
        ).toHaveBeenCalledWith({
          type: 'plan',
          limit: 8,
          page: 1,
        });
      });
      it('should return nothing', async () => {
        mockedRepository.prototype.getProjectsByDate.mockResolvedValue([[], 0]);

        const mockedRequest: PendingProjectsDto = {
          type: 'plan',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        expect(res).toEqual(undefined);

        expect(mockedRepository.prototype.getProjectsByDate).toHaveBeenCalled();
        expect(
          mockedRepository.prototype.getProjectsByDate,
        ).toHaveBeenCalledWith({
          type: 'plan',
          limit: 8,
          page: 1,
        });
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: true,
            isReportAccepted: true,
          },
          projectField: mockFields,
        };

        mockedRepository.prototype.getProjectsByDate.mockResolvedValue([
          [mockProject],
          1,
        ]);

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

        expect(mockedRepository.prototype.getProjectsByDate).toHaveBeenCalled();
        expect(
          mockedRepository.prototype.getProjectsByDate,
        ).toHaveBeenCalledWith({
          type: 'report',
          limit: 8,
          page: 1,
        });
      });
      it('should return nothing', async () => {
        mockedRepository.prototype.getProjectsByDate.mockResolvedValue([[], 0]);

        const mockedRequest: PendingProjectsDto = {
          type: 'report',
          limit: 8,
          page: 1,
        };

        const res = await service.getPendingProjects(mockedRequest);

        expect(res).toEqual(undefined);

        expect(mockedRepository.prototype.getProjectsByDate).toHaveBeenCalled();
        expect(
          mockedRepository.prototype.getProjectsByDate,
        ).toHaveBeenCalledWith({
          type: 'report',
          limit: 8,
          page: 1,
        });
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: null,
            isReportAccepted: null,
          },
          projectField: mockFields,
        };
        mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: null,
            isReportAccepted: null,
          },
          projectField: mockFields,
        };
        mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
          mockedRepository.prototype.findOne.mockResolvedValue(undefined);
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
            const mockProject: Project = {
              id: 1,
              projectName: 'test',
              teamName: 'test',
              techStacks: 'test',
              writer: {
                id: 1,
                email: 'test@example.com',
                name: 'test',
                studentNumber: 2400,
                projects: undefined,
                members: undefined,
              },
              projectType: 'test',
              githubUrl: null,
              serviceUrl: null,
              docsUrl: null,
              teacher: 'test',
              members: [],
              plan: undefined,
              report: undefined,
              status: {
                projectId: undefined,
                isPlanSubmitted: false,
                isReportSubmitted: false,
                planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
                reportSubmittedAt: new Date('2021-09-20T00:00:00'),
                isPlanAccepted: null,
                isReportAccepted: null,
              },
              projectField: [],
            };
            const mockConfirmRequest: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'plan',
            };
            mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
            const mockProject: Project = {
              id: 1,
              projectName: 'test',
              teamName: 'test',
              techStacks: 'test',
              writer: {
                id: 1,
                email: 'test@example.com',
                name: 'test',
                studentNumber: 2400,
                projects: undefined,
                members: undefined,
              },
              projectType: 'test',
              githubUrl: null,
              serviceUrl: null,
              docsUrl: null,
              teacher: 'test',
              members: [],
              plan: undefined,
              report: undefined,
              status: {
                projectId: undefined,
                isPlanSubmitted: true,
                isReportSubmitted: true,
                planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
                reportSubmittedAt: new Date('2021-09-20T00:00:00'),
                isPlanAccepted: true,
                isReportAccepted: false,
              },
              projectField: [],
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'plan',
            };
            mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: null,
            isReportAccepted: null,
          },
          projectField: mockFields,
        };
        mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
          writer: {
            id: 1,
            email: 'test@example.com',
            name: 'test',
            studentNumber: 2400,
            projects: undefined,
            members: undefined,
          },
          projectType: 'test',
          githubUrl: null,
          serviceUrl: null,
          docsUrl: null,
          teacher: 'test',
          members: [],
          plan: undefined,
          report: undefined,
          status: {
            projectId: undefined,
            isPlanSubmitted: true,
            isReportSubmitted: true,
            planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
            reportSubmittedAt: new Date('2021-09-20T00:00:00'),
            isPlanAccepted: null,
            isReportAccepted: null,
          },
          projectField: mockFields,
        };
        mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
          mockedRepository.prototype.findOne.mockResolvedValue(undefined);
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
            const mockProject: Project = {
              id: 1,
              projectName: 'test',
              teamName: 'test',
              techStacks: 'test',
              writer: {
                id: 1,
                email: 'test@example.com',
                name: 'test',
                studentNumber: 2400,
                projects: undefined,
                members: undefined,
              },
              projectType: 'test',
              githubUrl: null,
              serviceUrl: null,
              docsUrl: null,
              teacher: 'test',
              members: [],
              plan: undefined,
              report: undefined,
              status: {
                projectId: undefined,
                isPlanSubmitted: false,
                isReportSubmitted: false,
                planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
                reportSubmittedAt: new Date('2021-09-20T00:00:00'),
                isPlanAccepted: null,
                isReportAccepted: null,
              },
              projectField: [],
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'report',
            };
            mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
            const mockProject: Project = {
              id: 1,
              projectName: 'test',
              teamName: 'test',
              techStacks: 'test',
              writer: {
                id: 1,
                email: 'test@example.com',
                name: 'test',
                studentNumber: 2400,
                projects: undefined,
                members: undefined,
              },
              projectType: 'test',
              githubUrl: null,
              serviceUrl: null,
              docsUrl: null,
              teacher: 'test',
              members: [],
              plan: undefined,
              report: undefined,
              status: {
                projectId: undefined,
                isPlanSubmitted: true,
                isReportSubmitted: true,
                planSubmittedAt: new Date('2021-09-20T00:00:00Z'),
                reportSubmittedAt: new Date('2021-09-20T00:00:00'),
                isPlanAccepted: true,
                isReportAccepted: false,
              },
              projectField: [],
            };
            const mockConfirmRequestBody: ConfirmProjectBodyDto = {
              type: 'approve',
              comment: 'test',
            };
            const mockConfirmRequestParam: ConfirmProjectParamDto = {
              projectId: 1,
              type: 'report',
            };
            mockedRepository.prototype.findOne.mockResolvedValue(mockProject);
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
