import {
  AbstractRepository,
  EntityRepository,
  SelectQueryBuilder,
} from 'typeorm';
import { Project } from './project.entity';
import { Status } from '../status/status.entity';

export interface ProjectFindOneWhereOptions {
  id: number;
}

export interface UpdateProjectAcceptedOptions {
  id: number;
  type: 'plan' | 'report';
  status: boolean;
}

export interface ProjectFindByDateOptions {
  type: 'plan' | 'report';
  limit: number;
  page: number;
}

export interface ProjectSearchOptions {
  query: string;
  limit: number;
  page: number;
}

export interface ProjectConfirmedOptions {
  limit: number;
  page: number;
  fields: number[];
}

export interface ProjectRelationshipOptions {
  plan?: boolean;
  report?: boolean;
  members?: boolean;
  field?: boolean;
  status?: boolean;
  writer?: boolean;
}

@EntityRepository(Project)
export class ProjectRepository extends AbstractRepository<Project> {
  public async findOne(
    options: ProjectFindOneWhereOptions,
    relations: ProjectRelationshipOptions,
  ): Promise<Project> {
    const { id } = options;
    const qb = this.repository
      .createQueryBuilder('project')
      .where('projectId = :id', { id });

    this.addRelations(qb, relations);

    return qb.getOne();
  }

  public async updateProjectAccepted(
    options: UpdateProjectAcceptedOptions,
  ): Promise<void> {
    const { id, type, status } = options;

    const qb = this.createQueryBuilder('status')
      .update(Status)
      .where('status.projectId = :id', { id });

    switch (type) {
      case 'plan':
        qb.set({ isPlanAccepted: status });
        break;
      case 'report':
        qb.set({ isReportAccepted: status });
        break;
    }
    await qb.execute();
  }

  public async getProjectsByDate({
    type,
    limit,
    page,
  }: ProjectFindByDateOptions): Promise<[Project[], number]> {
    const qb = this.createQueryBuilder('project')
      .leftJoinAndSelect('project.status', 'status')
      .leftJoinAndSelect('project.projectField', 'projectField')
      .leftJoinAndSelect('projectField.fieldId', 'fieldId')
      .take(limit)
      .skip(limit * (page - 1));

    switch (type) {
      case 'plan':
        qb.where('status.isPlanSubmitted = 1')
          .andWhere('status.isPlanAccepted IS NULL')
          .orderBy('status.planSubmittedAt', 'ASC');
        break;
      case 'report':
        qb.where('status.isReportSubmitted = 1')
          .andWhere('status.isReportAccepted IS NULL')
          .orderBy('status.reportSubmittedAt', 'ASC');
        break;
    }

    return qb.getManyAndCount();
  }

  public async search(
    options: ProjectSearchOptions,
    relations: ProjectRelationshipOptions,
  ): Promise<[Project[], number]> {
    const { query, limit, page } = options;
    const qb = this.createQueryBuilder('project')
      .select()
      .where('project.projectName LIKE "%:query%"', { query })
      .take(limit)
      .skip(limit * (page - 1));

    this.addRelations(qb, relations);

    return qb.getManyAndCount();
  }

  public async getConfirmedProjects({
    limit,
    page,
    fields,
  }: ProjectConfirmedOptions): Promise<[Project[], number]> {
    const qb = this.createQueryBuilder('project')
      .leftJoinAndSelect('project.status', 'status')
      .leftJoinAndSelect('project.projectField', 'projectField')
      .leftJoinAndSelect('projectField.fieldId', 'fieldId')
      .where('status.isPlanAccepted = 1')
      .andWhere('status.isReportAccepted = 1')
      .orderBy('status.reportSubmittedAt', 'ASC')
      .take(limit)
      .skip(limit * (page - 1));

    if (fields)
      qb.andWhere('projectField.fieldId IN (:fields)', {
        fields,
      });

    return qb.getManyAndCount();
  }

  private addRelations(
    qb: SelectQueryBuilder<Project>,
    relations: ProjectRelationshipOptions,
  ): void {
    const { plan, report, members, field, status, writer } = relations;

    if (plan) qb.leftJoinAndSelect('project.plan', 'plan');
    if (report) qb.leftJoinAndSelect('project.report', 'report');
    if (members) qb.leftJoinAndSelect('project.members', 'members');
    if (field)
      qb.leftJoinAndSelect(
        'project.projectField',
        'projectField',
      ).leftJoinAndSelect('projectField.fieldId', 'fieldId');
    if (status) qb.leftJoinAndSelect('project.status', 'status');
    if (writer) qb.leftJoinAndSelect('project.writer', 'writer');
  }
}
