import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductionService } from './production.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrderQueryDto,
  StartProductionDto,
  CompleteProductionDto,
  RecordConsumptionDto,
} from './dto';
import { ProductionOrder } from './entities/production-order.entity';
import { ProductionBatch } from './entities/production-batch.entity';
import { MaterialConsumption } from './entities/material-consumption.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Production')
@Controller('production')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  // ==================== PRODUCTION ORDERS ====================

  @Get()
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get all production orders' })
  async findAll(@Query() query: ProductionOrderQueryDto) {
    return this.productionService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get production statistics' })
  async getStatistics() {
    return this.productionService.getStatistics();
  }

  @Get(':id')
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get production order by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductionOrder> {
    return this.productionService.findById(id);
  }

  @Post()
  @RequirePermissions(Resource.PRODUCTION, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create production order' })
  async create(
    @Body() dto: CreateProductionOrderDto,
    @CurrentUser() user: any,
  ): Promise<ProductionOrder> {
    return this.productionService.create(dto, user.userId);
  }

  @Put(':id')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Update production order' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderDto,
  ): Promise<ProductionOrder> {
    return this.productionService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.PRODUCTION, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete production order' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productionService.remove(id);
  }

  @Patch(':id/release')
  @RequirePermissions(Resource.PRODUCTION, Action.APPROVE)
  @ApiOperation({ summary: 'Release production order' })
  async release(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<ProductionOrder> {
    return this.productionService.release(id, user.userId);
  }

  @Patch(':id/start')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Start production' })
  async startProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: StartProductionDto,
    @CurrentUser() user: any,
  ): Promise<ProductionOrder> {
    return this.productionService.startProduction(id, dto, user.userId);
  }

  @Patch(':id/complete')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Complete production' })
  async completeProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteProductionDto,
    @CurrentUser() user: any,
  ): Promise<ProductionOrder> {
    return this.productionService.completeProduction(id, dto, user.userId);
  }

  @Patch(':id/hold')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Put production on hold' })
  async holdProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ): Promise<ProductionOrder> {
    return this.productionService.holdProduction(id, reason);
  }

  @Patch(':id/resume')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Resume production' })
  async resumeProduction(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductionOrder> {
    return this.productionService.resumeProduction(id);
  }

  @Patch(':id/cancel')
  @RequirePermissions(Resource.PRODUCTION, Action.UPDATE)
  @ApiOperation({ summary: 'Cancel production order' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ): Promise<ProductionOrder> {
    return this.productionService.cancel(id, reason);
  }

  // ==================== BATCHES ====================

  @Get(':id/batches')
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get production batches' })
  async getBatches(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductionBatch[]> {
    return this.productionService.getBatches(id);
  }

  @Post(':id/batches')
  @RequirePermissions(Resource.PRODUCTION, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create production batch' })
  async createBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
    @CurrentUser() user: any,
  ): Promise<ProductionBatch> {
    return this.productionService.createBatch(id, quantity, user.userId);
  }

  // ==================== MATERIAL CONSUMPTION ====================

  @Get(':id/consumptions')
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get material consumptions' })
  async getConsumptions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MaterialConsumption[]> {
    return this.productionService.getConsumptions(id);
  }

  @Post(':id/consumptions')
  @RequirePermissions(Resource.PRODUCTION, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record material consumption' })
  async recordConsumption(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordConsumptionDto,
    @CurrentUser() user: any,
  ): Promise<MaterialConsumption> {
    return this.productionService.recordConsumption(id, dto, user.userId);
  }

  @Get(':id/variance-report')
  @RequirePermissions(Resource.PRODUCTION, Action.READ)
  @ApiOperation({ summary: 'Get material variance report' })
  async getVarianceReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionService.getMaterialVarianceReport(id);
  }
}
