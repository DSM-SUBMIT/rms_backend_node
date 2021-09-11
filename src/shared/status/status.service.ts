import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async getStatusById(id: number): Promise<Status> {
    return await this.statusRepository.findOne(id);
  }

  async updatePlanAccepted(id: number, status: boolean): Promise<boolean> {
    const res = await this.statusRepository.update(id, {
      isPlanAccepted: status,
    });
    return res.affected ? true : false;
  }

  async updateReportAccepted(id: number, status: boolean): Promise<boolean> {
    const res = await this.statusRepository.update(id, {
      isReportAccepted: status,
    });
    return res.affected ? true : false;
  }
}
