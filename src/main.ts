import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './utils/interceptors/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: true,
    }),
  );

  const fileSwaggerConfig = new DocumentBuilder()
    .setTitle('RMS File API document')
    .setVersion('0.10.0')
    .addBearerAuth()
    .addServer('files-api.dsm-rms.com')
    .build();

  const fileDocument = SwaggerModule.createDocument(app, fileSwaggerConfig, {
    include: [FilesModule],
  });
  SwaggerModule.setup('apidocs/file', app, fileDocument);

  const adminSwaggerConfig = new DocumentBuilder()
    .setTitle('RMS Admin API document')
    .setVersion('0.10.0')
    .addBearerAuth()
    .addServer('admin-api.dsm-rms.com')
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminSwaggerConfig, {
    include: [AuthModule, ProjectsModule],
  });
  SwaggerModule.setup('apidocs/admin', app, adminDocument);

  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
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
