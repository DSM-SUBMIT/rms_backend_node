import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import * as Sentry from '@sentry/node';
import * as helmet from 'helmet';
import { SentryInterceptor } from './utils/interceptors/sentry.interceptor';
import { CacheControlInterceptor } from './utils/interceptors/CacheControl.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: true,
    }),
  );

  app.useGlobalInterceptors(new CacheControlInterceptor());

  const fileSwaggerConfig = new DocumentBuilder()
    .setTitle('RMS File API document')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();

  const fileDocument = SwaggerModule.createDocument(app, fileSwaggerConfig, {
    include: [FilesModule],
  });
  SwaggerModule.setup('apidocs/file', app, fileDocument);

  const adminSwaggerConfig = new DocumentBuilder()
    .setTitle('RMS Admin API document')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminSwaggerConfig, {
    include: [AuthModule, ProjectsModule],
  });
  SwaggerModule.setup('apidocs/admin', app, adminDocument);

  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      release: `${process.env.SENTRY_PROJECT_NAME}@${process.env.npm_package_version}`,
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
      ],
    });
    app.useGlobalInterceptors(new SentryInterceptor());
  }

  await app.listen(3000);
}
bootstrap();
