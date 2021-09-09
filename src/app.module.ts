import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Admin } from './auth/entities/admin.entity';
import { FilesModule } from './files/files.module';
import { PlansModule } from './plans/plans.module';
import { Admin } from './auth/entities/admin.entity';
import { User } from './users/entities/user.entity';
import { Project } from './projects/entities/project.entity';
import { Plan } from './plans/entities/plan.entity';
import { Report } from './reports/entities/report.entity';
import { Status } from './status/entities/status.entity';
import { Field } from './shared/fields/entities/field.entity';
import { Member } from './shared/members/entities/member.entity';
import { ProjectField } from './shared/projectField/entities/projectField.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
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
      logging: Boolean(process.env.DB_LOGGING),
    }),
    AuthModule,
    FilesModule,
    PlansModule,
    ReportsModule,
    ProjectsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
