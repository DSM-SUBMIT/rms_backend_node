import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { Admin } from './shared/entities/admin/admin.entity';
import { User } from './shared/entities/user/user.entity';
import { Project } from './shared/entities/project/project.entity';
import { Plan } from './shared/entities/plan/plan.entity';
import { Report } from './shared/entities/report/report.entity';
import { Status } from './shared/entities/status/status.entity';
import { Field } from './shared/entities/field/field.entity';
import { Member } from './shared/entities/member/member.entity';
import { ProjectField } from './shared/entities/projectField/projectField.entity';
import { ProjectsModule } from './projects/projects.module';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { connectionOptions } from './ormconfig';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...connectionOptions[process.env.NODE_ENV],
      entities: [
        Admin,
        User,
        Project,
        Plan,
        Report,
        Status,
        Field,
        Member,
        ProjectField,
      ],
    }),
    AuthModule,
    FilesModule,
    ProjectsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
