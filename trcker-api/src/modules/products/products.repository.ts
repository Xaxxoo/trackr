import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<Product | null> {
    return this.findOne({
      where: { sku, deletedAt: IsNull() },
      relations: ['category'],
    });
  }

  /**
   * Find product by barcode
   */
  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.findOne({
      where: { barcode, deletedAt: IsNull() },
      relations: ['category'],
    });
  }

  /**
   * Find active products only
   */
  async findActiveProducts(limit: number = 50): Promise<Product[]> {
    return this.find({
      where: { isActive: true, deletedAt: IsNull() },
      relations: ['category'],
      order: { name: 'ASC' },
      take: limit,
    });
  }

  /**
   * Find low stock products
   */
  async findLowStockProducts(): Promise<Product[]> {
    return this.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('stock', 's', 's.productId = product.id')
      .where('product.reorderLevel IS NOT NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('product.isActive = true')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .having('COALESCE(SUM(s.quantity), 0) <= product.reorderLevel')
      .getMany();
  }

  /**
   * Get product statistics by category
   */
  async getProductStatisticsByCategory(): Promise<any[]> {
    return this.createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.type', 'categoryType')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.deletedAt IS NULL')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.type')
      .getRawMany();
  }

  /**
   * Get product statistics by unit of measure
   */
  async getProductStatisticsByUnit(): Promise<any[]> {
    return this.createQueryBuilder('product')
      .select('product.unitOfMeasure', 'unitOfMeasure')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.deletedAt IS NULL')
      .groupBy('product.unitOfMeasure')
      .getRawMany();
  }

  /**
   * Calculate average prices
   */
  async getAveragePrices(): Promise<any> {
    return this.createQueryBuilder('product')
      .select('AVG(product.standardCost)', 'avgStandardCost')
      .addSelect('AVG(product.sellingPrice)', 'avgSellingPrice')
      .where('product.deletedAt IS NULL')
      .getRawOne();
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, limit: number = 10): Promise<Product[]> {
    return this.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedAt IS NULL')
      .andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .take(limit)
      .getMany();
  }

  /**
   * Check if SKU exists (excluding specific product)
   */
  async isSkuTaken(sku: string, excludeProductId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('product')
      .where('product.sku = :sku', { sku })
      .andWhere('product.deletedAt IS NULL');

    if (excludeProductId) {
      query.andWhere('product.id != :excludeProductId', { excludeProductId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Soft delete product
   */
  async softDelete(productId: string): Promise<void> {
    await this.update(productId, { deletedAt: new Date() });
  }

  /**
   * Restore soft deleted product
   */
  async restore(productId: string): Promise<void> {
    await this.update(productId, { deletedAt: null });
  }

  /**
   * Get products by category
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.find({
      where: { categoryId, deletedAt: IsNull() },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get products with stock information
   */
  async findWithStockLevels(warehouseId?: string): Promise<any[]> {
    const query = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('stock', 's', 's.productId = product.id')
      .select([
        'product',
        'category',
        'COALESCE(SUM(s.quantity), 0) as totalStock',
      ])
      .where('product.deletedAt IS NULL')
      .groupBy('product.id')
      .addGroupBy('category.id');

    if (warehouseId) {
      query.andWhere('s.warehouseId = :warehouseId', { warehouseId });
    }

    return query.getRawAndEntities();
  }
}