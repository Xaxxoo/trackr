import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateLocationDto,
  UpdateLocationDto,
  CreateStockMovementDto,
  WarehouseQueryDto,
  StockQueryDto,
} from './dto';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  // ==================== WAREHOUSES ====================

  @Get()
  @RequirePermissions(Resource.WAREHOUSES, Action.READ)
  @ApiOperation({ summary: 'Get all warehouses' })
  async findAll(@Query() query: WarehouseQueryDto) {
    return this.warehousesService.findAllWarehouses(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.WAREHOUSES, Action.READ)
  @ApiOperation({ summary: 'Get warehouse statistics' })
  async getStatistics() {
    return this.warehousesService.getStatistics();
  }

  @Get(':id')
  @RequirePermissions(Resource.WAREHOUSES, Action.READ)
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return this.warehousesService.findWarehouseById(id);
  }

  @Post()
  @RequirePermissions(Resource.WAREHOUSES, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create warehouse' })
  async create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehousesService.createWarehouse(dto);
  }

  @Put(':id')
  @RequirePermissions(Resource.WAREHOUSES, Action.UPDATE)
  @ApiOperation({ summary: 'Update warehouse' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehousesService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.WAREHOUSES, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete warehouse' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.warehousesService.removeWarehouse(id);
  }

  // ==================== LOCATIONS ====================

  @Get(':id/locations')
  @RequirePermissions(Resource.WAREHOUSES, Action.READ)
  @ApiOperation({ summary: 'Get warehouse locations' })
  async getLocations(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WarehouseLocation[]> {
    return this.warehousesService.getWarehouseLocations(id);
  }

  @Post(':id/locations')
  @RequirePermissions(Resource.WAREHOUSES, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create warehouse location' })
  async createLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLocationDto,
  ): Promise<WarehouseLocation> {
    return this.warehousesService.createLocation(id, dto);
  }

  @Put('locations/:locationId')
  @RequirePermissions(Resource.WAREHOUSES, Action.UPDATE)
  @ApiOperation({ summary: 'Update location' })
  async updateLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<WarehouseLocation> {
    return this.warehousesService.updateLocation(locationId, dto);
  }

  @Delete('locations/:locationId')
  @RequirePermissions(Resource.WAREHOUSES, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete location' })
  async removeLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ): Promise<void> {
    return this.warehousesService.removeLocation(locationId);
  }

  // ==================== STOCK ====================

  @Get('stock/all')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get all stock' })
  async getStock(@Query() query: StockQueryDto) {
    return this.warehousesService.getStock(query);
  }

  @Get('stock/low-stock')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStock(): Promise<Stock[]> {
    return this.warehousesService.getLowStockItems();
  }

  @Get('stock/product/:productId/summary')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get stock summary by product' })
  async getStockSummary(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.warehousesService.getStockSummaryByProduct(productId);
  }

  @Get('stock/:warehouseId/:productId')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get stock by warehouse and product' })
  async getStockByWarehouseAndProduct(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<Stock | null> {
    return this.warehousesService.getStockByProductAndWarehouse(productId, warehouseId);
  }

  // ==================== STOCK MOVEMENTS ====================

  @Get(':id/movements')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get stock movements' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.warehousesService.getStockMovements(id, page, limit);
  }

  @Post(':id/movements')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create stock movement' })
  async createMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: any,
  ): Promise<StockMovement> {
    return this.warehousesService.createStockMovement(id, dto, user.userId);
  }
}