import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enums/role.enum';
import { ConfirmProjectDto } from './dto/confirmProject.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('프로젝트 관련')
@Roles(Role.Admin)
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post(':projectId/confirm/:type')
  @HttpCode(200)
  @ApiOperation({ summary: '계획서/보고서 승인 여부 결정' })
  @ApiParam({ name: 'type', enum: ['plan', 'report'] })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiOkResponse()
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
}
