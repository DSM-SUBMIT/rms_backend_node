import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}

  async getConfirmedReportById(id: number) {
    return await this.reportsRepository.findOne(id, {
      relations: ['projectId', 'projectId.writerId'],
    });
  }

  async getReportById(id: number) {
    return await this.reportsRepository.findOne(id, {
      relations: ['projectId', 'projectId.writerId'],
    });
  }

  async updateVideoUrl(id: number, url: string): Promise<boolean> {
    const res = await this.reportsRepository.update(id, { videoUrl: url });
    return res.affected ? true : false;
  }
}
