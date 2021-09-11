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

  async getReportById(id: number) {
    return await this.reportsRepository.findOne(id, {
      relations: ['projectId'],
    });
  }

  async updatePdfUrl(id: number, url: string): Promise<boolean> {
    const res = await this.reportsRepository.update(id, { pdfUrl: url });
    return res ? true : false;
  }

  async updateVideoUrl(id: number, url: string): Promise<boolean> {
    const res = await this.reportsRepository.update(id, { videoUrl: url });
    return res ? true : false;
  }
}
