import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  CreateReportScheduleDto,
  GenerateReportDto,
  InventoryReportParamsDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== TEMPLATES ====================

  @Get('templates')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get all report templates' })
  async getTemplates(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.reportsService.findAllTemplates(page, limit);
  }

  @Get('templates/:id')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findTemplateById(id);
  }

  @Post('templates')
  @RequirePermissions(Resource.REPORTS, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create report template' })
  async createTemplate(@Body() dto: CreateReportTemplateDto, @CurrentUser() user: any) {
    return this.reportsService.createTemplate(dto, user.userId);
  }

  @Put('templates/:id')
  @RequirePermissions(Resource.REPORTS, Action.UPDATE)
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportTemplateDto,
  ) {
    return this.reportsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @RequirePermissions(Resource.REPORTS, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.deleteTemplate(id);
  }

  // ==================== SCHEDULES ====================

  @Get('schedules')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get all schedules' })
  async getSchedules() {
    return this.reportsService.getSchedules();
  }

  @Post('schedules')
  @RequirePermissions(Resource.REPORTS, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create schedule' })
  async createSchedule(@Body() dto: CreateReportScheduleDto, @CurrentUser() user: any) {
    return this.reportsService.createSchedule(dto, user.userId);
  }

  @Patch('schedules/:id/pause')
  @RequirePermissions(Resource.REPORTS, Action.UPDATE)
  @ApiOperation({ summary: 'Pause schedule' })
  async pauseSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.pauseSchedule(id);
  }

  @Patch('schedules/:id/resume')
  @RequirePermissions(Resource.REPORTS, Action.UPDATE)
  @ApiOperation({ summary: 'Resume schedule' })
  async resumeSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.resumeSchedule(id);
  }

  // ==================== GENERATION ====================

  @Post('generate')
  @RequirePermissions(Resource.REPORTS, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate report' })
  async generateReport(@Body() dto: GenerateReportDto, @CurrentUser() user: any) {
    return this.reportsService.generateReport(dto, user.userId);
  }

  @Post('inventory')
  @RequirePermissions(Resource.REPORTS, Action.CREATE)
  @ApiOperation({ summary: 'Generate inventory report' })
  async generateInventoryReport(@Body() params: InventoryReportParamsDto, @CurrentUser() user: any) {
    return this.reportsService.generateInventoryReport(params, user.userId);
  }

  // ==================== EXECUTIONS ====================

  @Get('executions')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get all executions' })
  async getExecutions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.reportsService.findAllExecutions(page, limit);
  }

  @Get('executions/:id')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get execution by ID' })
  async getExecution(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findExecutionById(id);
  }

  @Get('download/:id')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Download report' })
  async downloadReport(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { filePath, format } = await this.reportsService.downloadReport(id);
    // Would stream file to response
    res.download(filePath);
  }

  // ==================== STATISTICS ====================

  @Get('statistics')
  @RequirePermissions(Resource.REPORTS, Action.READ)
  @ApiOperation({ summary: 'Get report statistics' })
  async getStatistics() {
    return this.reportsService.getStatistics();
  }
}