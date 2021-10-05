import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ReportsModule } from 'src/shared/reports/reports.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { StatusModule } from 'src/shared/status/status.module';

@Module({
  imports: [ProjectsModule, ReportsModule, StatusModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
