import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: Repository<Report>) {}

  async getReport(id: number) {
    return await this.reportsRepository.findOne(id);
  }
}
