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
import { NoContentInterceptor } from './interceptors/NoContent.interceptor';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('프로젝트 관련')
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
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({})
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
  @ApiOkResponse()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
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
  @ApiOkResponse()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  search(@Query('query') query: string) {
    return this.projectsService.search(query);
  }

  @Get(':projectId/:type')
  @UseInterceptors(NoContentInterceptor)
  @ApiOperation({ summary: '프로젝트 상세 보기' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiOkResponse()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  projectDetail(
    @Param('projectId') projectId: number,
    @Param('type') type: 'plan' | 'report',
  ) {
    return this.projectsService.getDetail(projectId, type);
  }
}
