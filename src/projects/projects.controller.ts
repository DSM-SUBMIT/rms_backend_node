import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enums/role.enum';
import { ConfirmProjectDto } from './dto/request/confirmProject.dto';
import { ProjectDetailDto } from './dto/response/projectDetail.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { NoContentInterceptor } from './interceptors/NoContent.interceptor';
import { ProjectsService } from './projects.service';

@Controller({ host: 'admin-api.dsm-rms.com', path: 'projects' })
@ApiTags('프로젝트 API')
@Roles(Role.Admin)
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Patch('confirm/:projectId/:type')
  @HttpCode(204)
  @ApiOperation({ summary: '계획서/보고서 승인 여부 결정' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiNoContentResponse({
    description:
      '요청이 성공적으로 완료되었으며, 추가적인 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiConflictResponse({ description: '이미 승인 여부가 결정된 프로젝트임' })
  confirm(
    @Param('projectId') projectId: number,
    @Param('type') type: 'plan' | 'report',
    @Body() payload: ConfirmProjectDto,
  ) {
    return this.projectsService.confirmProject(projectId, type, payload);
  }

  @Get('pending')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '승인 대기중인 계획서/보고서 목록' })
  @ApiQuery({ name: 'type', enum: ['plan', 'report'] })
  @ApiQuery({ name: 'limit', schema: { type: 'number', default: 8 } })
  @ApiQuery({ name: 'page', schema: { type: 'number', default: 1 } })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  getPendingProjects(
    @Query('type') type: string,
    @Query('limit') limit = 8,
    @Query('page') page = 1,
  ) {
    return this.projectsService.getPendingProjects(type, limit, page);
  }

  @Get('search')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '프로젝트 검색' })
  @ApiQuery({ name: 'query', type: 'string', description: '검색어' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  search(
    @Query('query') query: string,
    @Query('limit') limit = 8,
    @Query('page') page = 1,
  ) {
    return this.projectsService.search(query, limit, page);
  }

  @Get(':projectId')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '프로젝트 상세 보기' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectDetailDto,
  })
  @ApiNoContentResponse({
    description:
      '요청은 정상적이나, 계획서와 보고서가 존재하지 않는 프로젝트임.',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  projectDetail(@Param('projectId') projectId: number) {
    return this.projectsService.getDetail(projectId);
  }

  @Get('confirmed')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '모두 승인된 프로젝트 목록' })
  @ApiQuery({ name: 'limit', schema: { type: 'number', default: 8 } })
  @ApiQuery({ name: 'page', schema: { type: 'number', default: 1 } })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  confirmedProjects(@Query('limit') limit = 8, @Query('page') page = 1) {
    return this.projectsService.getConfirmed(limit, page);
  }
}
