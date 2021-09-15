import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectField } from './entities/projectField.entity';
import { ProjectFieldsService } from './projectField.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectField])],
  providers: [ProjectFieldsService],
  exports: [ProjectFieldsService],
})
export class ProjectFieldModule {}
