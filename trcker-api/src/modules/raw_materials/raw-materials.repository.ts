import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { RawMaterial } from './entities/raw-material.entity';

@Injectable()
export class RawMaterialsRepository extends Repository<RawMaterial> {
  constructor(private dataSource: DataSource) {
    super(RawMaterial, dataSource.createEntityManager());
  }

  /**
   * Find by code
   */
  async findByCode(code: string): Promise<RawMaterial | null> {
    return this.findOne({
      where: { code, deletedAt: IsNull() },
      relations: ['primarySupplier'],
    });
  }

  /**
   * Find active materials
   */
  async findActiveMaterials(): Promise<RawMaterial[]> {
    return this.find({
      where: { isActive: true, deletedAt: IsNull() },
      relations: ['primarySupplier'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Find low stock materials
   */
  async findLowStockMaterials(): Promise<any[]> {
    return this.createQueryBuilder('rm')
      .leftJoinAndSelect('rm.primarySupplier', 'supplier')
      .leftJoin('stock', 's', 's.productId = rm.id')
      .where('rm.deletedAt IS NULL')
      .andWhere('rm.isActive = true')
      .groupBy('rm.id')
      .addGroupBy('supplier.id')
      .having('COALESCE(SUM(s.quantity), 0) <= rm.reorderLevel')
      .getMany();
  }

  /**
   * Get statistics by type
   */
  async getStatisticsByType(): Promise<any[]> {
    return this.createQueryBuilder('rm')
      .select('rm.type', 'type')
      .addSelect('COUNT(rm.id)', 'count')
      .where('rm.deletedAt IS NULL')
      .groupBy('rm.type')
      .getRawMany();
  }

  /**
   * Get statistics by grade
   */
  async getStatisticsByGrade(): Promise<any[]> {
    return this.createQueryBuilder('rm')
      .select('rm.qualityGrade', 'grade')
      .addSelect('COUNT(rm.id)', 'count')
      .where('rm.deletedAt IS NULL')
      .groupBy('rm.qualityGrade')
      .getRawMany();
  }

  /**
   * Calculate total inventory value
   */
  async calculateInventoryValue(): Promise<number> {
    const result = await this.createQueryBuilder('rm')
      .leftJoin('stock', 's', 's.productId = rm.id')
      .select('SUM(s.quantity * rm.standardCost)', 'total')
      .where('rm.deletedAt IS NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  /**
   * Get average cost
   */
  async getAverageCost(): Promise<number> {
    const result = await this.createQueryBuilder('rm')
      .select('AVG(rm.standardCost)', 'avgCost')
      .where('rm.deletedAt IS NULL')
      .getRawOne();

    return parseFloat(result?.avgCost || '0');
  }

  /**
   * Check if code exists
   */
  async isCodeTaken(code: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('rm')
      .where('rm.code = :code', { code })
      .andWhere('rm.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('rm.id != :excludeId', { excludeId });
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