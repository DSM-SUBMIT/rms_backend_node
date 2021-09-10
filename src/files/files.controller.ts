import {
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
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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

@Controller('files')
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
}
