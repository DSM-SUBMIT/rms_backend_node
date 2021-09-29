import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { UsersModule } from 'src/shared/users/users.module';
import { ReportsModule } from 'src/shared/reports/reports.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [ProjectsModule, ReportsModule, UsersModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
