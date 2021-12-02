import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { ProjectRepository } from 'src/shared/entities/project/project.repository';
import { FieldRepository } from '../shared/entities/field/field.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectRepository, FieldRepository]),
    MailModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
