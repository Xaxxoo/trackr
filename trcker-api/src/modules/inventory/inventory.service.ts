import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, In } from 'typeorm';
import { InventoryRepository } from './inventory.repository';
import {
  CreateTransactionDto,
  BulkTransactionsDto,
  BulkTransactionResponseDto,
  TransactionQueryDto,
} from './dto';
import {
  InventoryTransaction,
  TransactionType,
} from './entities/inventory-transaction.entity';
import {
  PaginatedTransactionsResponse,
  TransactionSummary,
} from './interfaces/transaction-response.interface';
import { InventorySummary } from './interfaces/inventory-summary.interface';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryRepository)
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  /**
   * Create a single inventory transaction
   */
  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<InventoryTransaction> {
    try {
      // Generate transaction number
      const transactionNumber = await this.inventoryRepository.generateTransactionNumber();

      // Validate business rules
      await this.validateTransaction(createTransactionDto);

      // Create transaction
      const transaction = this.inventoryRepository.create({
        ...createTransactionDto,
        transactionNumber,
        createdBy: userId,
      });

      const savedTransaction = await this.inventoryRepository.save(transaction);

      // Update stock levels (would integrate with StockService)
      // await this.updateStockLevels(savedTransaction);

      return this.inventoryRepository.findWithRelations(savedTransaction.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create transaction',
        error.message,
      );
    }
  }

  /**
   * Create multiple transactions in bulk
   */
  async createBulkTransactions(
    bulkTransactionsDto: BulkTransactionsDto,
    userId: string,
  ): Promise<BulkTransactionResponseDto> {
    const response: BulkTransactionResponseDto = {
      created: 0,
      failed: 0,
      transactionIds: [],
      errors: [],
    };

    for (let i = 0; i < bulkTransactionsDto.transactions.length; i++) {
      try {
        const transaction = await this.createTransaction(
          bulkTransactionsDto.transactions[i],
          userId,
        );
        response.created++;
        response.transactionIds.push(transaction.id);
      } catch (error) {
        response.failed++;
        response.errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    return response;
  }

  /**
   * Find all transactions with filters and pagination
   */
  async findAll(
    query: TransactionQueryDto,
  ): Promise<PaginatedTransactionsResponse> {
    const {
      page = 1,
      limit = 20,
      productId,
      warehouseId,
      transactionType,
      referenceType,
      referenceId,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.product', 'product')
      .leftJoinAndSelect('txn.warehouse', 'warehouse')
      .leftJoinAndSelect('txn.creator', 'creator')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (productId) {
      queryBuilder.andWhere('txn.productId = :productId', { productId });
    }

    if (warehouseId) {
      queryBuilder.andWhere('txn.warehouseId = :warehouseId', { warehouseId });
    }

    if (transactionType) {
      queryBuilder.andWhere('txn.transactionType = :transactionType', {
        transactionType,
      });
    }

    if (referenceType) {
      queryBuilder.andWhere('txn.referenceType = :referenceType', {
        referenceType,
      });
    }

    if (referenceId) {
      queryBuilder.andWhere('txn.referenceId = :referenceId', { referenceId });
    }

    if (startDate) {
      queryBuilder.andWhere('txn.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('txn.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(txn.transactionNumber ILIKE :search OR txn.notes ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'transactionNumber', 'quantity', 'totalCost'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`txn.${sortField}`, sortOrder);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find transaction by ID
   */
  async findOne(id: string): Promise<InventoryTransaction> {
    const transaction = await this.inventoryRepository.findWithRelations(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Find transactions by product
   */
  async findByProduct(productId: string): Promise<InventoryTransaction[]> {
    return this.inventoryRepository.findByProduct(productId);
  }

  /**
   * Find transactions by warehouse
   */
  async findByWarehouse(warehouseId: string): Promise<InventoryTransaction[]> {
    return this.inventoryRepository.findByWarehouse(warehouseId);
  }

  /**
   * Calculate total inventory value
   */
  async calculateInventoryValue(
    warehouseId?: string,
    productId?: string,
  ): Promise<{ totalValue: number }> {
    const totalValue = await this.inventoryRepository.calculateInventoryValue(
      warehouseId,
      productId,
    );

    return { totalValue };
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionSummary> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const summary = await this.inventoryRepository.getTransactionSummary(
      start,
      end,
    );

    const result: TransactionSummary = {
      totalTransactions: 0,
      totalValue: 0,
      inTransactions: 0,
      outTransactions: 0,
      adjustmentTransactions: 0,
      transferTransactions: 0,
    };

    summary.forEach((item) => {
      result.totalTransactions += parseInt(item.count);
      result.totalValue += parseFloat(item.totalValue || '0');

      switch (item.type) {
        case TransactionType.IN:
          result.inTransactions = parseInt(item.count);
          break;
        case TransactionType.OUT:
          result.outTransactions = parseInt(item.count);
          break;
        case TransactionType.ADJUSTMENT:
          result.adjustmentTransactions = parseInt(item.count);
          break;
        case TransactionType.TRANSFER:
          result.transferTransactions = parseInt(item.count);
          break;
      }
    });

    return result;
  }

  /**
   * Get stock movement report
   */
  async getStockMovementReport(
    productId: string,
    warehouseId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.inventoryRepository.getStockMovementReport(
      productId,
      warehouseId,
      start,
      end,
    );
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(
    warehouseId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<InventorySummary> {
    const query = this.inventoryRepository.createQueryBuilder('txn');

    if (warehouseId) {
      query.where('txn.warehouseId = :warehouseId', { warehouseId });
    }

    if (startDate) {
      query.andWhere('txn.createdAt >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      query.andWhere('txn.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    // Get total value and count
    const totalStats = await query
      .select('COUNT(*)', 'count')
      .addSelect('SUM(txn.totalCost)', 'value')
      .getRawOne();

    // Get by type
    const byType = await this.inventoryRepository.getTransactionSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    // Get by warehouse
    const byWarehouse = await this.inventoryRepository
      .createQueryBuilder('txn')
      .leftJoin('txn.warehouse', 'warehouse')
      .select('txn.warehouseId', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect('COUNT(*)', 'transactionCount')
      .addSelect('SUM(txn.totalCost)', 'totalValue')
      .groupBy('txn.warehouseId')
      .addGroupBy('warehouse.name')
      .getRawMany();

    // Get recent transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = await this.inventoryRepository
      .createQueryBuilder('txn')
      .select("DATE(txn.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(txn.totalCost)', 'value')
      .where('txn.createdAt >= :date', { date: sevenDaysAgo })
      .groupBy('DATE(txn.createdAt)')
      .orderBy('DATE(txn.createdAt)', 'DESC')
      .getRawMany();

    return {
      totalValue: parseFloat(totalStats.value || '0'),
      transactionCount: parseInt(totalStats.count || '0'),
      byType: byType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
        totalQuantity: parseFloat(item.totalQuantity),
        totalValue: parseFloat(item.totalValue),
      })),
      byWarehouse: byWarehouse.map((item) => ({
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        transactionCount: parseInt(item.transactionCount),
        totalValue: parseFloat(item.totalValue),
      })),
      recentTransactions: recentTransactions.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
        value: parseFloat(item.value),
      })),
    };
  }

  /**
   * Validate transaction business rules
   */
  private async validateTransaction(
    dto: CreateTransactionDto,
  ): Promise<void> {
    // Validate quantity
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Validate unit cost
    if (dto.unitCost < 0) {
      throw new BadRequestException('Unit cost cannot be negative');
    }

    // Validate reference consistency
    if (dto.referenceType && !dto.referenceId) {
      throw new BadRequestException(
        'Reference ID is required when reference type is provided',
      );
    }

    // Additional validation for OUT transactions
    if (dto.transactionType === TransactionType.OUT) {
      // Check if sufficient stock is available
      // This would require integration with StockService
      // const stock = await this.stockService.getAvailableStock(dto.productId, dto.warehouseId);
      // if (stock < dto.quantity) {
      //   throw new BadRequestException('Insufficient stock available');
      // }
    }
  }

  /**
   * Update stock levels based on transaction
   * This is a placeholder - actual implementation would integrate with StockService
   */
  private async updateStockLevels(
    transaction: InventoryTransaction,
  ): Promise<void> {
    // Integration point with StockService
    // await this.stockService.updateStock({
    //   productId: transaction.productId,
    //   warehouseId: transaction.warehouseId,
    //   quantity: transaction.signedQuantity,
    // });
  }
}