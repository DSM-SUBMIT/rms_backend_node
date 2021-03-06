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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enums/role.enum';
import {
  ConfirmProjectBodyDto,
  ConfirmProjectParamDto,
} from './dto/request/confirmProject.dto';
import { ProjectsListDto } from './dto/response/projectsList.dto';
import { NoContentInterceptor } from 'src/utils/interceptors/NoContent.interceptor';
import { ProjectsService } from './projects.service';
import { PendingProjectsDto } from './dto/request/pendingProjects.dto';
import { SearchProjectsDto } from './dto/request/searchProjects.dto';
import { ConfirmedProjectsDto } from './dto/request/confirmedProjects.dto';
import { ProjectDetailDto } from './dto/request/projectDetail.dto';
import { PlanDetailDto } from './dto/response/planDetail.dto';
import { ReportDetailDto } from './dto/response/reportDetail.dto';

@Controller({ host: process.env.ADMIN_API_BASE_URL, path: 'projects' })
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
  @ApiNoContentResponse({
    description:
      '요청이 성공적으로 완료되었으며, 추가적인 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  @ApiNotFoundResponse({ description: '프로젝트를 찾을 수 없음' })
  @ApiConflictResponse({ description: '이미 승인 여부가 결정된 프로젝트임' })
  confirm(
    @Param() paramPayload: ConfirmProjectParamDto,
    @Body() bodyPayload: ConfirmProjectBodyDto,
  ) {
    return this.projectsService.confirmProject(paramPayload, bodyPayload);
  }

  @Get('pending')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '승인 대기중인 계획서/보고서 목록' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  getPendingProjects(@Query() payload: PendingProjectsDto) {
    return this.projectsService.getPendingProjects(payload);
  }

  @Get('search')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '프로젝트 검색' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  search(@Query() payload: SearchProjectsDto) {
    return this.projectsService.search(payload);
  }

  @Get(':projectId/plan')
  @ApiOperation({ summary: '계획서 상세 보기' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: PlanDetailDto,
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없거나 계획서가 제출되지 않았음',
  })
  planDetail(@Param() payload: ProjectDetailDto) {
    return this.projectsService.getPlanDetail(payload.projectId);
  }

  @Get(':projectId/report')
  @ApiOperation({ summary: '보고서 상세 보기' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ReportDetailDto,
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없거나 보고서가 제출되지 않았음',
  })
  reportDetail(@Param() payload: ProjectDetailDto) {
    return this.projectsService.getReportDetail(payload.projectId);
  }

  @Get('confirmed')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '모두 승인된 프로젝트 목록' })
  @ApiOkResponse({
    description: '요청이 정상적으로 완료됨',
    type: ProjectsListDto,
  })
  @ApiNoContentResponse({
    description: '요청은 정상적이나, 일치하는 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '토큰이 올바르지 않음' })
  @ApiForbiddenResponse({ description: '권한이 없음' })
  confirmedProjects(@Query() payload: ConfirmedProjectsDto) {
    return this.projectsService.getConfirmed(payload);
  }
}
