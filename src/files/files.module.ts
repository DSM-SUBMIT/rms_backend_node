import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ProjectRepository } from 'src/shared/entities/project/project.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectRepository])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
