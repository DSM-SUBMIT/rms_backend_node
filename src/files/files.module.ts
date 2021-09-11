import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PlansModule } from '../shared/plans/plans.module';
import { UsersModule } from 'src/shared/users/users.module';
import { ReportsModule } from 'src/shared/reports/reports.module';

@Module({
  imports: [PlansModule, ReportsModule, UsersModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
