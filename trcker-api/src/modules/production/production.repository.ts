import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull, In } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from './entities/production-order.entity';

@Injectable()
export class ProductionRepository extends Repository<ProductionOrder> {
  constructor(private dataSource: DataSource) {
    super(ProductionOrder, dataSource.createEntityManager());
  }

  /**
   * Find by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<ProductionOrder | null> {
    return this.findOne({
      where: { orderNumber, deletedAt: IsNull() },
      relations: ['product', 'bom', 'batches', 'materialConsumptions'],
    });
  }

  /**
   * Find active orders
   */
  async findActiveOrders(): Promise<ProductionOrder[]> {
    return this.find({
      where: {
        status: In([
          ProductionOrderStatus.SCHEDULED,
          ProductionOrderStatus.RELEASED,
          ProductionOrderStatus.IN_PROGRESS,
        ]),
        deletedAt: IsNull(),
      },
      relations: ['product'],
      order: { plannedStartDate: 'ASC' },
    });
  }

  /**
   * Find orders by product
   */
  async findByProduct(productId: string): Promise<ProductionOrder[]> {
    return this.find({
      where: { productId, deletedAt: IsNull() },
      relations: ['bom'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics by status
   */
  async getStatisticsByStatus(): Promise<any[]> {
    return this.createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(po.id)', 'count')
      .where('po.deletedAt IS NULL')
      .groupBy('po.status')
      .getRawMany();
  }

  /**
   * Get statistics by priority
   */
  async getStatisticsByPriority(): Promise<any[]> {
    return this.createQueryBuilder('po')
      .select('po.priority', 'priority')
      .addSelect('COUNT(po.id)', 'count')
      .where('po.deletedAt IS NULL')
      .groupBy('po.priority')
      .getRawMany();
  }

  /**
   * Get production quantities
   */
  async getProductionQuantities(): Promise<any> {
    return this.createQueryBuilder('po')
      .select('SUM(po.plannedQuantity)', 'totalPlanned')
      .addSelect('SUM(po.producedQuantity)', 'totalProduced')
      .addSelect('SUM(po.acceptedQuantity)', 'totalAccepted')
      .where('po.deletedAt IS NULL')
      .getRawOne();
  }

  /**
   * Get average quality yield
   */
  async getAverageQualityYield(): Promise<number> {
    const result = await this.createQueryBuilder('po')
      .select('AVG(po.acceptedQuantity / NULLIF(po.producedQuantity, 0) * 100)', 'avgYield')
      .where('po.deletedAt IS NULL')
      .andWhere('po.producedQuantity > 0')
      .getRawOne();

    return parseFloat(result?.avgYield || '0');
  }

  /**
   * Get average completion rate
   */
  async getAverageCompletionRate(): Promise<number> {
    const result = await this.createQueryBuilder('po')
      .select('AVG(po.producedQuantity / NULLIF(po.plannedQuantity, 0) * 100)', 'avgCompletion')
      .where('po.deletedAt IS NULL')
      .andWhere('po.plannedQuantity > 0')
      .getRawOne();

    return parseFloat(result?.avgCompletion || '0');
  }

  /**
   * Check if order number exists
   */
  async isOrderNumberTaken(orderNumber: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('po')
      .where('po.orderNumber = :orderNumber', { orderNumber })
      .andWhere('po.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('po.id != :excludeId', { excludeId });
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

  /**
   * Restore
   */
  async restore(id: string): Promise<void> {
    await this.update(id, { deletedAt: null });
  }
}