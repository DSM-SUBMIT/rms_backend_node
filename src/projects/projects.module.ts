import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { StatusModule } from 'src/shared/status/status.module';
import { UsersModule } from 'src/shared/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), StatusModule, UsersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
