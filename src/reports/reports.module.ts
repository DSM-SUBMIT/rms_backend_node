import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Module({
  controllers: [],
  providers: [ReportsService],
})
export class ReportsModule {}
