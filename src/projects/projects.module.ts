import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { StatusModule } from 'src/shared/status/status.module';
import { UsersModule } from 'src/shared/users/users.module';
import { PlansModule } from 'src/shared/plans/plans.module';
import { ReportsModule } from 'src/shared/reports/reports.module';
import { MembersModule } from 'src/shared/members/members.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    MailModule,
    MembersModule,
    PlansModule,
    ReportsModule,
    StatusModule,
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
