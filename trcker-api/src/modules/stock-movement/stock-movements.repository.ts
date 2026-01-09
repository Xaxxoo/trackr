import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull, Between } from 'typeorm';
import { StockMovement, MovementType, MovementStatus } from './entities/stock-movement.entity';

@Injectable()
export class StockMovementsRepository extends Repository<StockMovement> {
  constructor(private dataSource: DataSource) {
    super(StockMovement, dataSource.createEntityManager());
  }

  /**
   * Find by movement number
   */
  async findByMovementNumber(movementNumber: string): Promise<StockMovement | null> {
    return this.findOne({
      where: { movementNumber, deletedAt: IsNull() },
      relations: ['warehouse', 'product'],
    });
  }

  /**
   * Get movements by product
   */
  async getMovementsByProduct(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StockMovement[]> {
    const query = this.createQueryBuilder('sm')
      .leftJoinAndSelect('sm.warehouse', 'warehouse')
      .where('sm.productId = :productId', { productId })
      .andWhere('sm.deletedAt IS NULL');

    if (startDate && endDate) {
      query.andWhere('sm.movementDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.orderBy('sm.movementDate', 'DESC').getMany();
  }

  /**
   * Get statistics by type
   */
  async getStatisticsByType(): Promise<any[]> {
    return this.createQueryBuilder('sm')
      .select('sm.movementType', 'type')
      .addSelect('COUNT(sm.id)', 'count')
      .addSelect('SUM(sm.quantity)', 'totalQuantity')
      .where('sm.deletedAt IS NULL')
      .groupBy('sm.movementType')
      .getRawMany();
  }

  /**
   * Get statistics by status
   */
  async getStatisticsByStatus(): Promise<any[]> {
    return this.createQueryBuilder('sm')
      .select('sm.status', 'status')
      .addSelect('COUNT(sm.id)', 'count')
      .where('sm.deletedAt IS NULL')
      .groupBy('sm.status')
      .getRawMany();
  }

  /**
   * Get receipt count
   */
  async getReceiptCount(): Promise<number> {
    return this.count({
      where: {
        movementType: MovementType.RECEIPT,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get issue count
   */
  async getIssueCount(): Promise<number> {
    return this.count({
      where: {
        movementType: MovementType.ISSUE,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get total quantities
   */
  async getTotalQuantities(): Promise<any> {
    const receipts = await this.createQueryBuilder('sm')
      .select('COALESCE(SUM(sm.quantity), 0)', 'total')
      .where('sm.movementType IN (:...types)', {
        types: [MovementType.RECEIPT, MovementType.PRODUCTION_RECEIPT, MovementType.PURCHASE_RECEIPT],
      })
      .andWhere('sm.deletedAt IS NULL')
      .getRawOne();

    const issues = await this.createQueryBuilder('sm')
      .select('COALESCE(SUM(sm.quantity), 0)', 'total')
      .where('sm.movementType IN (:...types)', {
        types: [MovementType.ISSUE, MovementType.PRODUCTION_ISSUE, MovementType.SALES_ISSUE],
      })
      .andWhere('sm.deletedAt IS NULL')
      .getRawOne();

    return {
      totalReceipts: parseFloat(receipts.total),
      totalIssues: parseFloat(issues.total),
    };
  }

  /**
   * Check if movement number exists
   */
  async isMovementNumberTaken(movementNumber: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('sm')
      .where('sm.movementNumber = :movementNumber', { movementNumber })
      .andWhere('sm.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('sm.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Soft delete
   */
  async softDelete(id: string): Promise<void> {
    await this.update(id, { deletedAt: new Date() });
  }
}