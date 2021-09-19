import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { UsersModule } from 'src/shared/users/users.module';
import { ReportsModule } from 'src/shared/reports/reports.module';

@Module({
  imports: [ReportsModule, UsersModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
