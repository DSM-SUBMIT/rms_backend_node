import {
  Delete,
  Get,
  Param,
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
  ApiProduces,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { FilesService } from './files.service';

@Controller({ host: 'files-api.dsm-rms.com', path: 'files' })
@ApiTags('파일 API')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':projectId/images')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: '이미지 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
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
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  uploadImages(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Request() req,
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadImages(files, req.user.userId, projectId);
  }

  @Delete(':projectId/image/:imageName')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 파일 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '요청이 성공적으로 완료됨' })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiServiceUnavailableResponse({
    description: '서비스를 이용할 수 없음(알 수 없는 오류) ',
  })
  deleteImage(
    @Request() req,
    @Param('projectId') projectId: number,
    @Param('imageName') imageName: string,
  ) {
    return this.filesService.deleteImage(req.user.userId, projectId, imageName);
  }

  @Get(':projectId/image/:imageName')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이미지 파일 확인' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '시연 영상 다운로드' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiProduces('image/*')
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  getImage(
    @Request() req,
    @Param('projectId') projectId: number,
    @Param('imageName') imageName: string,
  ) {
    return this.filesService.getImage(req, projectId, imageName);
  }

  @Post(':projectId/video')
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
  @ApiCreatedResponse({
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

  @Delete(':projectId/video')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '시연 영상 삭제' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '요청이 정상적으로 완료됨' })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  deleteVideo(@Request() req, @Param('projectId') projectId: number) {
    return this.filesService.deleteVideo(req.user.userId, projectId);
  }

  @Get(':projectId/video')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '시연 영상 다운로드' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiProduces('multipart/form-data')
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    schema: {
      type: 'file',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  getVideo(@Request() req, @Param('projectId') projectId: number) {
    return this.filesService.getVideo(req, projectId);
  }

  @Post(':projectId/archive')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('archive'))
  @ApiOperation({ summary: '결과물 압축 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: '요청이 정상적으로 완료됨',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiConflictResponse({ description: '이미 동영상 파일이 업로드되어 있음' })
  uploadArchive(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
    @Param('projectId') projectId: number,
  ) {
    return this.filesService.uploadArchive(file, req.user.userId, projectId);
  }

  @Delete(':projectId/archive')
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결과물 압축 파일 삭제' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '요청이 정상적으로 완료됨' })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 존재하지 않음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  deleteArchive(@Request() req, @Param('projectId') projectId: number) {
    return this.filesService.deleteArchive(req.user.userId, projectId);
  }

  @Get(':projectId/archive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결과물 압출 파일 다운로드' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBearerAuth()
  @ApiProduces('multipart/form-data')
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    schema: {
      type: 'file',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  getArchive(@Request() req, @Param('projectId') projectId: number) {
    return this.filesService.getArchive(req, projectId);
  }
}
