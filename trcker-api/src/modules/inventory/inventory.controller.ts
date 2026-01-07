import {
  Controller,
  Get,
  Post,
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateTransactionDto,
  BulkTransactionsDto,
  BulkTransactionResponseDto,
  TransactionQueryDto,
} from './dto';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import {
  PaginatedTransactionsResponse,
  TransactionSummary,
} from './interfaces/transaction-response.interface';
import { InventorySummary } from './interfaces/inventory-summary.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('transactions')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create inventory transaction',
    description: 'Record a new inventory transaction (IN, OUT, TRANSFER, ADJUSTMENT)',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: InventoryTransaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: any,
  ): Promise<InventoryTransaction> {
    return this.inventoryService.createTransaction(
      createTransactionDto,
      user.userId,
    );
  }

  @Post('transactions/bulk')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create multiple transactions in bulk',
    description: 'Create up to 100 transactions in a single request',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk transactions processed',
    type: BulkTransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async createBulkTransactions(
    @Body() bulkTransactionsDto: BulkTransactionsDto,
    @CurrentUser() user: any,
  ): Promise<BulkTransactionResponseDto> {
    return this.inventoryService.createBulkTransactions(
      bulkTransactionsDto,
      user.userId,
    );
  }

  @Get('transactions')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get all transactions with filters',
    description: 'Retrieve paginated list of inventory transactions with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async findAll(
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactionsResponse> {
    return this.inventoryService.findAll(query);
  }

  @Get('transactions/:id')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieve detailed information about a specific transaction',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Transaction UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: InventoryTransaction,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryTransaction> {
    return this.inventoryService.findOne(id);
  }

  @Get('transactions/product/:productId')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get transactions by product',
    description: 'Retrieve all transactions for a specific product',
  })
  @ApiParam({
    name: 'productId',
    type: String,
    format: 'uuid',
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [InventoryTransaction],
  })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<InventoryTransaction[]> {
    return this.inventoryService.findByProduct(productId);
  }

  @Get('transactions/warehouse/:warehouseId')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get transactions by warehouse',
    description: 'Retrieve all transactions for a specific warehouse',
  })
  @ApiParam({
    name: 'warehouseId',
    type: String,
    format: 'uuid',
    description: 'Warehouse UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [InventoryTransaction],
  })
  async findByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ): Promise<InventoryTransaction[]> {
    return this.inventoryService.findByWarehouse(warehouseId);
  }

  @Get('value')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Calculate inventory value',
    description: 'Calculate total value of inventory with optional filters',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    type: String,
    description: 'Filter by warehouse',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: String,
    description: 'Filter by product',
  })
  @ApiResponse({
    status: 200,
    description: 'Value calculated successfully',
    schema: {
      type: 'object',
      properties: {
        totalValue: { type: 'number', example: 125450.75 },
      },
    },
  })
  async calculateInventoryValue(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
  ): Promise<{ totalValue: number }> {
    return this.inventoryService.calculateInventoryValue(warehouseId, productId);
  }

  @Get('summary')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get transaction summary',
    description: 'Get summary statistics of transactions',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
  })
  async getTransactionSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TransactionSummary> {
    return this.inventoryService.getTransactionSummary(startDate, endDate);
  }

  @Get('movement-report')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get stock movement report',
    description: 'Get detailed stock movement report for a product in a warehouse',
  })
  @ApiQuery({ name: 'productId', required: true, type: String })
  @ApiQuery({ name: 'warehouseId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
  })
  async getStockMovementReport(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Query('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.inventoryService.getStockMovementReport(
      productId,
      warehouseId,
      startDate,
      endDate,
    );
  }

  @Get('dashboard')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({
    summary: 'Get inventory dashboard data',
    description: 'Get comprehensive inventory summary for dashboard',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getInventorySummary(
    @Query('warehouseId') warehouseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InventorySummary> {
    return this.inventoryService.getInventorySummary(
      warehouseId,
      startDate,
      endDate,
    );
  }
}