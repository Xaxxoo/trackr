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
import { RawMaterialsService } from './raw-materials.service';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RawMaterialQueryDto,
  CreateBatchDto,
  ReceiveBatchDto,
  CreateSupplierDto,
} from './dto';
import { RawMaterial } from './entities/raw-material.entity';
import { RawMaterialBatch, BatchStatus } from './entities/raw-material-batch.entity';
import { RawMaterialSupplier } from './entities/raw-material-supplier.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Raw Materials')
@Controller('raw-materials')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  // ==================== RAW MATERIALS ====================

  @Get()
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get all raw materials' })
  async findAllMaterials(@Query() query: RawMaterialQueryDto) {
    return this.rawMaterialsService.findAllRawMaterials(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get raw material statistics' })
  async getStatistics() {
    return this.rawMaterialsService.getRawMaterialStatistics();
  }

  @Get('low-stock')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get low stock materials' })
  async getLowStock(): Promise<RawMaterial[]> {
    return this.rawMaterialsService.getLowStockMaterials();
  }

  @Get(':id')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get raw material by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOneMaterial(@Param('id', ParseUUIDPipe) id: string): Promise<RawMaterial> {
    return this.rawMaterialsService.findRawMaterialById(id);
  }

  @Get('code/:code')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get raw material by code' })
  @ApiParam({ name: 'code', type: String })
  async findByCode(@Param('code') code: string): Promise<RawMaterial> {
    return this.rawMaterialsService.findRawMaterialByCode(code);
  }

  @Post()
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create raw material' })
  async createMaterial(@Body() dto: CreateRawMaterialDto): Promise<RawMaterial> {
    return this.rawMaterialsService.createRawMaterial(dto);
  }

  @Put(':id')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Update raw material' })
  async updateMaterial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRawMaterialDto,
  ): Promise<RawMaterial> {
    return this.rawMaterialsService.updateRawMaterial(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.INVENTORY, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete raw material' })
  async removeMaterial(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rawMaterialsService.removeRawMaterial(id);
  }

  @Patch(':id/restore')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Restore deleted raw material' })
  async restoreMaterial(@Param('id', ParseUUIDPipe) id: string): Promise<RawMaterial> {
    return this.rawMaterialsService.restoreRawMaterial(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Activate raw material' })
  async activateMaterial(@Param('id', ParseUUIDPipe) id: string): Promise<RawMaterial> {
    return this.rawMaterialsService.toggleRawMaterialStatus(id, true);
  }

  @Patch(':id/deactivate')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Deactivate raw material' })
  async deactivateMaterial(@Param('id', ParseUUIDPipe) id: string): Promise<RawMaterial> {
    return this.rawMaterialsService.toggleRawMaterialStatus(id, false);
  }

  // ==================== BATCHES ====================

  @Get('batches/all')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get all batches' })
  @ApiQuery({ name: 'rawMaterialId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BatchStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllBatches(
    @Query('rawMaterialId') rawMaterialId?: string,
    @Query('status') status?: BatchStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rawMaterialsService.findAllBatches(rawMaterialId, status, page, limit);
  }

  @Get('batches/expiring')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get expiring batches' })
  @ApiQuery({ name: 'days', required: false, description: 'Days threshold (default: 30)' })
  async getExpiringBatches(@Query('days') days?: number): Promise<RawMaterialBatch[]> {
    return this.rawMaterialsService.getExpiringBatches(days);
  }

  @Get('batches/expired')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get expired batches' })
  async getExpiredBatches(): Promise<RawMaterialBatch[]> {
    return this.rawMaterialsService.getExpiredBatches();
  }

  @Get('batches/:id')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get batch by ID' })
  async findOneBatch(@Param('id', ParseUUIDPipe) id: string): Promise<RawMaterialBatch> {
    return this.rawMaterialsService.findBatchById(id);
  }

  @Post('batches')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create batch' })
  async createBatch(
    @Body() dto: CreateBatchDto,
    @CurrentUser() user: any,
  ): Promise<RawMaterialBatch> {
    return this.rawMaterialsService.createBatch(dto, user.userId);
  }

  @Patch('batches/:id/receive')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Receive batch' })
  async receiveBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveBatchDto,
    @CurrentUser() user: any,
  ): Promise<RawMaterialBatch> {
    return this.rawMaterialsService.receiveBatch(id, dto, user.userId);
  }

  @Patch('batches/:id/approve')
  @RequirePermissions(Resource.INVENTORY, Action.APPROVE)
  @ApiOperation({ summary: 'Approve batch after quality check' })
  async approveBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<RawMaterialBatch> {
    return this.rawMaterialsService.approveBatch(id, user.userId);
  }

  @Patch('batches/:id/reject')
  @RequirePermissions(Resource.INVENTORY, Action.APPROVE)
  @ApiOperation({ summary: 'Reject batch after quality check' })
  async rejectBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<RawMaterialBatch> {
    return this.rawMaterialsService.rejectBatch(id, reason, user.userId);
  }

  // ==================== SUPPLIERS ====================

  @Get('suppliers/all')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get all suppliers' })
  async findAllSuppliers(): Promise<RawMaterialSupplier[]> {
    return this.rawMaterialsService.findAllSuppliers();
  }

  @Get('suppliers/:id')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get supplier by ID' })
  async findOneSupplier(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RawMaterialSupplier> {
    return this.rawMaterialsService.findSupplierById(id);
  }

  @Post('suppliers')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create supplier' })
  async createSupplier(@Body() dto: CreateSupplierDto): Promise<RawMaterialSupplier> {
    return this.rawMaterialsService.createSupplier(dto);
  }

  @Put('suppliers/:id')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateSupplierDto>,
  ): Promise<RawMaterialSupplier> {
    return this.rawMaterialsService.updateSupplier(id, dto);
  }
}