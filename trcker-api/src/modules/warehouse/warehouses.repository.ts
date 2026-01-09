import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesRepository extends Repository<Warehouse> {
  constructor(private dataSource: DataSource) {
    super(Warehouse, dataSource.createEntityManager());
  }

  /**
   * Find by code
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    return this.findOne({
      where: { code, deletedAt: IsNull() },
      relations: ['locations'],
    });
  }

  /**
   * Find active warehouses
   */
  async findActiveWarehouses(): Promise<Warehouse[]> {
    return this.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find default warehouse
   */
  async findDefaultWarehouse(): Promise<Warehouse | null> {
    return this.findOne({
      where: { isDefault: true, isActive: true, deletedAt: IsNull() },
    });
  }

  /**
   * Get statistics by type
   */
  async getStatisticsByType(): Promise<any[]> {
    return this.createQueryBuilder('wh')
      .select('wh.type', 'type')
      .addSelect('COUNT(wh.id)', 'count')
      .where('wh.deletedAt IS NULL')
      .groupBy('wh.type')
      .getRawMany();
  }

  /**
   * Get total capacity
   */
  async getTotalCapacity(): Promise<any> {
    return this.createQueryBuilder('wh')
      .select('SUM(wh.totalCapacity)', 'totalCapacity')
      .addSelect('SUM(wh.usedCapacity)', 'usedCapacity')
      .where('wh.deletedAt IS NULL')
      .andWhere('wh.isActive = true')
      .getRawOne();
  }

  /**
   * Check if code exists
   */
  async isCodeTaken(code: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('wh')
      .where('wh.code = :code', { code })
      .andWhere('wh.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('wh.id != :excludeId', { excludeId });
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