import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  CreateReportScheduleDto,
  GenerateReportDto,
  InventoryReportParamsDto,
} from './dto';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportSchedule, ScheduleStatus } from './entities/report-schedule.entity';
import { ReportExecution, ExecutionStatus } from './entities/report-execution.entity';
import {
  GenerateReportResponse,
  PaginatedTemplatesResponse,
  PaginatedExecutionsResponse,
} from './interfaces/report-response.interface';
import { ReportStatistics } from './interfaces/report-statistics.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportTemplate)
    private readonly templatesRepository: Repository<ReportTemplate>,
    @InjectRepository(ReportSchedule)
    private readonly schedulesRepository: Repository<ReportSchedule>,
    @InjectRepository(ReportExecution)
    private readonly executionsRepository: Repository<ReportExecution>,
  ) {}

  // ==================== TEMPLATES ====================

  async createTemplate(dto: CreateReportTemplateDto, userId: string): Promise<ReportTemplate> {
    const exists = await this.templatesRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });

    if (exists) {
      throw new ConflictException(`Template with code ${dto.code} already exists`);
    }

    const template = this.templatesRepository.create({
      ...dto,
      createdBy: userId,
    });

    return this.templatesRepository.save(template);
  }

  async findAllTemplates(page = 1, limit = 20): Promise<PaginatedTemplatesResponse> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.templatesRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTemplateById(id: string): Promise<ReportTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(id: string, dto: UpdateReportTemplateDto): Promise<ReportTemplate> {
    const template = await this.findTemplateById(id);

    if (template.isSystem) {
      throw new BadRequestException('Cannot modify system templates');
    }

    Object.assign(template, dto);
    return this.templatesRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findTemplateById(id);

    if (template.isSystem) {
      throw new BadRequestException('Cannot delete system templates');
    }

    await this.templatesRepository.update(id, { deletedAt: new Date() });
  }

  // ==================== SCHEDULES ====================

  async createSchedule(dto: CreateReportScheduleDto, userId: string): Promise<ReportSchedule> {
    await this.findTemplateById(dto.templateId);

    const nextRunDate = this.calculateNextRunDate(
      new Date(dto.startDate),
      dto.frequency,
    );

    const schedule = this.schedulesRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      nextRunDate,
      createdBy: userId,
    });

    return this.schedulesRepository.save(schedule);
  }

  async getSchedules(): Promise<ReportSchedule[]> {
    return this.schedulesRepository.find({
      where: { status: ScheduleStatus.ACTIVE },
      relations: ['template'],
      order: { nextRunDate: 'ASC' },
    });
  }

  async pauseSchedule(id: string): Promise<ReportSchedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    schedule.status = ScheduleStatus.PAUSED;
    return this.schedulesRepository.save(schedule);
  }

  async resumeSchedule(id: string): Promise<ReportSchedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    schedule.status = ScheduleStatus.ACTIVE;
    return this.schedulesRepository.save(schedule);
  }

  async cancelSchedule(id: string): Promise<ReportSchedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    schedule.status = ScheduleStatus.CANCELLED;
    return this.schedulesRepository.save(schedule);
  }

  // ==================== REPORT GENERATION ====================

  async generateReport(dto: GenerateReportDto, userId: string): Promise<GenerateReportResponse> {
    const template = await this.findTemplateById(dto.templateId);
    const executionNumber = await this.generateExecutionNumber();

    const execution = this.executionsRepository.create({
      executionNumber,
      templateId: dto.templateId,
      format: dto.format || template.defaultFormat,
      parameters: dto.parameters,
      status: ExecutionStatus.PENDING,
      startTime: new Date(),
      createdBy: userId,
    });

    const saved = await this.executionsRepository.save(execution);

    // Process the report generation
    try {
      await this.processReportGeneration(saved.id, template, dto.parameters);
    } catch (error) {
      await this.executionsRepository.update(saved.id, {
        status: ExecutionStatus.FAILED,
        errorMessage: error.message,
        endTime: new Date(),
      });
      throw error;
    }

    const completed = await this.findExecutionById(saved.id);

    return {
      execution: completed,
      downloadUrl: completed.filePath ? `/reports/download/${completed.id}` : undefined,
    };
  }

  async generateInventoryReport(params: InventoryReportParamsDto, userId: string) {
    // This would integrate with actual inventory data
    const data = await this.fetchInventoryData(params);

    return {
      title: 'Inventory Report',
      generatedAt: new Date(),
      parameters: params,
      data,
      summary: {
        totalItems: data.length,
        totalQuantity: data.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: data.reduce((sum, item) => sum + item.totalValue, 0),
        lowStockItems: data.filter(item => item.status === 'LOW_STOCK').length,
      },
    };
  }

  // ==================== EXECUTIONS ====================

  async findAllExecutions(page = 1, limit = 20): Promise<PaginatedExecutionsResponse> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.executionsRepository.findAndCount({
      relations: ['template'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findExecutionById(id: string): Promise<ReportExecution> {
    const execution = await this.executionsRepository.findOne({
      where: { id },
      relations: ['template'],
    });

    if (!execution) {
      throw new NotFoundException(`Execution with ID ${id} not found`);
    }

    return execution;
  }

  async downloadReport(executionId: string): Promise<{ filePath: string; format: string }> {
    const execution = await this.findExecutionById(executionId);

    if (execution.status !== ExecutionStatus.COMPLETED) {
      throw new BadRequestException('Report is not completed yet');
    }

    if (!execution.filePath) {
      throw new NotFoundException('Report file not found');
    }

    return {
      filePath: execution.filePath,
      format: execution.format,
    };
  }

  // ==================== STATISTICS ====================

  async getStatistics(): Promise<ReportStatistics> {
    const [
      totalTemplates,
      activeTemplates,
      totalExecutions,
      templatesByCategory,
      executionsByStatus,
      scheduledReports,
      avgExecutionTime,
    ] = await Promise.all([
      this.templatesRepository.count({ where: { deletedAt: IsNull() } }),
      this.templatesRepository.count({
        where: { isActive: true, deletedAt: IsNull() },
      }),
      this.executionsRepository.count(),
      this.templatesRepository
        .createQueryBuilder('t')
        .select('t.category', 'category')
        .addSelect('COUNT(t.id)', 'count')
        .where('t.deletedAt IS NULL')
        .groupBy('t.category')
        .getRawMany(),
      this.executionsRepository
        .createQueryBuilder('e')
        .select('e.status', 'status')
        .addSelect('COUNT(e.id)', 'count')
        .groupBy('e.status')
        .getRawMany(),
      this.schedulesRepository.count({ where: { status: ScheduleStatus.ACTIVE } }),
      this.executionsRepository
        .createQueryBuilder('e')
        .select('AVG(EXTRACT(EPOCH FROM (e.endTime - e.startTime)))', 'avgTime')
        .where('e.status = :status', { status: ExecutionStatus.COMPLETED })
        .getRawOne(),
    ]);

    return {
      totalTemplates,
      activeTemplates,
      totalExecutions,
      templatesByCategory: templatesByCategory.map(item => ({
        category: item.category,
        count: parseInt(item.count),
      })),
      executionsByStatus: executionsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      averageExecutionTime: parseFloat(avgExecutionTime?.avgTime || '0'),
      totalReportsGenerated: totalExecutions,
      scheduledReports,
    };
  }

  // ==================== HELPER METHODS ====================

  private async processReportGeneration(
    executionId: string,
    template: ReportTemplate,
    parameters: any,
  ): Promise<void> {
    await this.executionsRepository.update(executionId, {
      status: ExecutionStatus.PROCESSING,
    });

    // Simulate report generation (in real implementation, this would call specific generators)
    const data = await this.fetchReportData(template, parameters);
    const filePath = await this.saveReportFile(executionId, data, template.defaultFormat);

    await this.executionsRepository.update(executionId, {
      status: ExecutionStatus.COMPLETED,
      filePath,
      fileSize: 245678, // Would be actual file size
      endTime: new Date(),
      rowCount: data.length,
    });
  }

  private async fetchReportData(template: ReportTemplate, parameters: any): Promise<any[]> {
    // This would execute the actual query based on report type
    return [];
  }

  private async fetchInventoryData(params: InventoryReportParamsDto): Promise<any[]> {
    // Mock data - would integrate with actual stock repository
    return [
      {
        productCode: 'DIA-M-001',
        productName: 'Baby Diaper Medium',
        warehouse: 'Main Warehouse',
        quantity: 1000,
        availableQuantity: 850,
        reservedQuantity: 150,
        unitCost: 48.15,
        totalValue: 48150,
        reorderPoint: 200,
        status: 'AVAILABLE',
      },
    ];
  }

  private async saveReportFile(executionId: string, data: any, format: string): Promise<string> {
    // Would generate actual file and save to storage
    return `/storage/reports/${executionId}.${format.toLowerCase()}`;
  }

  private calculateNextRunDate(startDate: Date, frequency: string): Date {
    const next = new Date(startDate);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  private async generateExecutionNumber(): Promise<string> {
    const count = await this.executionsRepository.count();
    return `EXEC-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }
}