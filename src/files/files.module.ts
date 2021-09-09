import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PlansModule } from '../shared/plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
