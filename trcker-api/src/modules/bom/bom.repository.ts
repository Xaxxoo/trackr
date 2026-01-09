import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Bom, BomStatus } from './entities/bom.entity';

@Injectable()
export class BomRepository extends Repository<Bom> {
  constructor(private dataSource: DataSource) {
    super(Bom, dataSource.createEntityManager());
  }

  /**
   * Find by BOM number
   */
  async findByBomNumber(bomNumber: string): Promise<Bom | null> {
    return this.findOne({
      where: { bomNumber, deletedAt: IsNull() },
      relations: ['product', 'items'],
    });
  }

  /**
   * Find active BOMs
   */
  async findActiveBoms(): Promise<Bom[]> {
    return this.find({
      where: { isActive: true, status: BomStatus.ACTIVE, deletedAt: IsNull() },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find default BOM for product
   */
  async findDefaultBomForProduct(productId: string): Promise<Bom | null> {
    return this.findOne({
      where: {
        productId,
        isDefault: true,
        isActive: true,
        deletedAt: IsNull(),
      },
      relations: ['items'],
    });
  }

  /**
   * Find all BOMs for product
   */
  async findBomsByProduct(productId: string): Promise<Bom[]> {
    return this.find({
      where: { productId, deletedAt: IsNull() },
      relations: ['items'],
      order: { version: 'DESC' },
    });
  }

  /**
   * Get statistics by type
   */
  async getStatisticsByType(): Promise<any[]> {
    return this.createQueryBuilder('bom')
      .select('bom.bomType', 'type')
      .addSelect('COUNT(bom.id)', 'count')
      .where('bom.deletedAt IS NULL')
      .groupBy('bom.bomType')
      .getRawMany();
  }

  /**
   * Get statistics by product
   */
  async getStatisticsByProduct(): Promise<any[]> {
    return this.createQueryBuilder('bom')
      .leftJoin('bom.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('COUNT(bom.id)', 'bomCount')
      .where('bom.deletedAt IS NULL')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .getRawMany();
  }

  /**
   * Get average items per BOM
   */
  async getAverageItemsPerBom(): Promise<number> {
    const result = await this.createQueryBuilder('bom')
      .leftJoin('bom.items', 'items')
      .select('AVG(item_count)', 'avgItems')
      .from(
        (qb) =>
          qb
            .select('bom.id', 'bomId')
            .addSelect('COUNT(items.id)', 'item_count')
            .from(Bom, 'bom')
            .leftJoin('bom.items', 'items')
            .where('bom.deletedAt IS NULL')
            .groupBy('bom.id'),
        'subquery',
      )
      .getRawOne();

    return parseFloat(result?.avgItems || '0');
  }

  /**
   * Get average cost per BOM
   */
  async getAverageCostPerBom(): Promise<number> {
    const result = await this.createQueryBuilder('bom')
      .select('AVG(bom.totalMaterialCost)', 'avgCost')
      .where('bom.deletedAt IS NULL')
      .getRawOne();

    return parseFloat(result?.avgCost || '0');
  }

  /**
   * Check if BOM number exists
   */
  async isBomNumberTaken(bomNumber: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('bom')
      .where('bom.bomNumber = :bomNumber', { bomNumber })
      .andWhere('bom.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('bom.id != :excludeId', { excludeId });
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