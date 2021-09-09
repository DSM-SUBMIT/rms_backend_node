import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Admin } from './auth/entities/admin.entity';
import { FilesModule } from './files/files.module';
import { PlansModule } from './plans/plans.module';
import { ReportsModule } from './reports/reports.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

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
      entities: [Admin],
      synchronize: false,
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
