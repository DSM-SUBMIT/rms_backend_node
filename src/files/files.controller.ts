import {
  Get,
  Param,
  Put,
  Request,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { FilesService } from './files.service';

@Controller({ path: 'files' })
@ApiTags('파일 업로드')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('images')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: '이미지 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: '요청이 성공적으로 완료되어 리소스가 생성됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  uploadImages(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Request() req,
  ) {
    return this.filesService.uploadImages(files, `${req.user.userId}`);
  }

  @Post('pdf/:type/:projectId')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('pdf'))
  @ApiOperation({ summary: 'PDF 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: '요청이 성공적으로 완료되어 리소스가 생성됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiConflictResponse({ description: '이미 PDF 파일이 업로드되어 있음' })
  uploadPdf(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
    @Param('type') type: 'plan' | 'report',
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadPdf(
      file,
      `${req.user.userId}`,
      type,
      projectId,
    );
  }

  @Post('video/:projectId')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  @ApiOperation({ summary: '시연 영상 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiConflictResponse({ description: '이미 동영상 파일이 업로드되어 있음' })
  uploadVideo(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadVideo(file, req.user.userId, projectId);
  }

  @Put('pdf/:type/:projectId')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('pdf'))
  @ApiOperation({ summary: 'PDF 파일 재업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  reUploadPdf(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
    @Param('type') type: 'plan' | 'report',
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadPdf(
      file,
      `${req.user.userId}`,
      type,
      projectId,
      false,
    );
  }

  @Put('video/:projectId')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  @ApiOperation({ summary: '시연 영상 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  reUploadVideo(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadVideo(
      file,
      req.user.userId,
      projectId,
      false,
    );
  }

  @Get('pdf/:type/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'PDF 파일 다운로드' })
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '요청이 성공하여 파일이 반환됨' })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  downloadPdf(
    @Param('type') type: 'plan' | 'report',
    @Param('projectId') projectId: number,
    @Request() req,
  ) {
    return this.filesService.getPdf(type, projectId, req);
  }
}
