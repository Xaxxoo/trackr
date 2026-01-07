import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, In } from 'typeorm';
import { InventoryTransaction, TransactionType } from './entities/inventory-transaction.entity';

@Injectable()
export class InventoryRepository extends Repository<InventoryTransaction> {
  constructor(private dataSource: DataSource) {
    super(InventoryTransaction, dataSource.createEntityManager());
  }

  /**
   * Generate unique transaction number
   */
  async generateTransactionNumber(): Promise<string> {
    const prefix = 'TXN';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of transactions this month
    const startOfMonth = new Date(year, new Date().getMonth(), 1);
    const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);
    
    const count = await this.count({
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });
    
    const sequence = String(count + 1).padStart(6, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  /**
   * Get transactions with relations
   */
  async findWithRelations(id: string): Promise<InventoryTransaction | null> {
    return this.findOne({
      where: { id },
      relations: ['product', 'warehouse', 'creator'],
    });
  }

  /**
   * Get transactions by product
   */
  async findByProduct(
    productId: string,
    limit: number = 50,
  ): Promise<InventoryTransaction[]> {
    return this.find({
      where: { productId },
      relations: ['warehouse', 'creator'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get transactions by warehouse
   */
  async findByWarehouse(
    warehouseId: string,
    limit: number = 50,
  ): Promise<InventoryTransaction[]> {
    return this.find({
      where: { warehouseId },
      relations: ['product', 'creator'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Calculate inventory value
   */
  async calculateInventoryValue(
    warehouseId?: string,
    productId?: string,
  ): Promise<number> {
    const query = this.createQueryBuilder('txn')
      .select('SUM(txn.totalCost)', 'total');

    if (warehouseId) {
      query.andWhere('txn.warehouseId = :warehouseId', { warehouseId });
    }

    if (productId) {
      query.andWhere('txn.productId = :productId', { productId });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total || '0');
  }

  /**
   * Get transaction summary by type
   */
  async getTransactionSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const query = this.createQueryBuilder('txn')
      .select('txn.transactionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(txn.quantity)', 'totalQuantity')
      .addSelect('SUM(txn.totalCost)', 'totalValue')
      .groupBy('txn.transactionType');

    if (startDate) {
      query.andWhere('txn.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('txn.createdAt <= :endDate', { endDate });
    }

    return query.getRawMany();
  }

  /**
   * Get stock movement report
   */
  async getStockMovementReport(
    productId: string,
    warehouseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const transactions = await this.find({
      where: {
        productId,
        warehouseId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    let openingBalance = 0;
    let inQuantity = 0;
    let outQuantity = 0;
    let adjustmentQuantity = 0;

    transactions.forEach((txn) => {
      if (txn.transactionType === TransactionType.IN) {
        inQuantity += Number(txn.quantity);
      } else if (txn.transactionType === TransactionType.OUT) {
        outQuantity += Number(txn.quantity);
      } else if (txn.transactionType === TransactionType.ADJUSTMENT) {
        adjustmentQuantity += Number(txn.quantity);
      }
    });

    const closingBalance = openingBalance + inQuantity - outQuantity + adjustmentQuantity;

    return {
      productId,
      warehouseId,
      startDate,
      endDate,
      openingBalance,
      inQuantity,
      outQuantity,
      adjustmentQuantity,
      closingBalance,
      transactions: transactions.length,
    };
  }

  /**
   * Bulk insert transactions
   */
  async bulkInsert(
    transactions: Partial<InventoryTransaction>[],
  ): Promise<InventoryTransaction[]> {
    return this.dataSource.transaction(async (manager) => {
      const saved: InventoryTransaction[] = [];
      
      for (const txn of transactions) {
        const entity = manager.create(InventoryTransaction, txn);
        const result = await manager.save(entity);
        saved.push(result);
      }
      
      return saved;
    });
  }
}