import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async getStatusDescByPlanDate(
    limit: number,
    page: number,
  ): Promise<[Status[], number]> {
    return await this.statusRepository.findAndCount({
      where: {
        isPlanSubmitted: true,
        isPlanAccepted: IsNull(),
      },
      order: {
        planSubmittedAt: 'ASC',
      },
      take: limit,
      skip: limit * (page - 1),
      relations: [
        'projectId',
        'projectId.projectField',
        'projectId.projectField.fieldId',
      ],
    });
  }

  async getStatusDescByReportDate(
    limit: number,
    page: number,
  ): Promise<[Status[], number]> {
    return await this.statusRepository.findAndCount({
      where: {
        isReportSubmitted: true,
        isReportAccepted: IsNull(),
      },
      order: {
        reportSubmittedAt: 'ASC',
      },
      take: limit,
      skip: limit * (page - 1),
      relations: [
        'projectId',
        'projectId.projectField',
        'projectId.projectField.fieldId',
      ],
    });
  }

  async getConfirmedStatus(
    limit: number,
    page: number,
    fieldId: number[],
  ): Promise<[Status[], number]> {
    return await this.statusRepository
      .createQueryBuilder('status')
      .leftJoinAndSelect('status.projectId', 'projectId')
      .leftJoinAndSelect('projectId.projectField', 'projectField')
      .leftJoinAndSelect('projectField.fieldId', 'fieldId')
      .where('status.isPlanAccepted = 1')
      .andWhere('status.isReportAccepted = 1')
      .andWhere(
        fieldId !== undefined
          ? 'projectField.fieldId IN (:fieldId)'
          : 'NULL IS NULL',
        { fieldId },
      )
      .orderBy('status.reportSubmittedAt', 'ASC')
      .take(limit)
      .skip(limit * (page - 1))
      .getManyAndCount();
  }

  async updatePlanAccepted(id: number, status: boolean): Promise<boolean> {
    const res = await this.statusRepository.update(id, {
      isPlanAccepted: status,
    });
    if (status === false) {
      await this.statusRepository.update(id, {
        isPlanSubmitted: false,
      });
    }
    return res.affected ? true : false;
  }

  async updateReportAccepted(id: number, status: boolean): Promise<boolean> {
    const res = await this.statusRepository.update(id, {
      isReportAccepted: status,
    });
    if (status === false) {
      await this.statusRepository.update(id, {
        isReportSubmitted: false,
      });
    }
    return res.affected ? true : false;
  }

  async getStatusById(id: number): Promise<Status> {
    return await this.statusRepository.findOne(id, {
      relations: ['projectId', 'projectId.writerId'],
    });
  }
}
