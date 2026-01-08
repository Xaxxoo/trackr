import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { ProductsRepository } from './products.repository';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  BulkUpdatePricesDto,
  BulkUpdatePricesResponseDto,
} from './dto';
import { Product } from './entities/product.entity';
import { ProductCategory, CategoryType } from './entities/product-category.entity';
import { PaginatedProductsResponse } from './interfaces/product-response.interface';
import { ProductStatistics } from './interfaces/product-statistics.interface';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsRepository)
    private readonly productsRepository: ProductsRepository,
    @InjectRepository(ProductCategory)
    private readonly categoriesRepository: Repository<ProductCategory>,
  ) {}

  /**
   * Create new product
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingSku = await this.productsRepository.findBySku(
      createProductDto.sku,
    );

    if (existingSku) {
      throw new ConflictException(
        `Product with SKU ${createProductDto.sku} already exists`,
      );
    }

    // Check if barcode exists
    if (createProductDto.barcode) {
      const existingBarcode = await this.productsRepository.findByBarcode(
        createProductDto.barcode,
      );

      if (existingBarcode) {
        throw new ConflictException(
          `Product with barcode ${createProductDto.barcode} already exists`,
        );
      }
    }

    // Validate category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    // Validate pricing
    if (
      createProductDto.sellingPrice &&
      createProductDto.sellingPrice < createProductDto.standardCost
    ) {
      throw new BadRequestException(
        'Selling price cannot be less than standard cost',
      );
    }

    // Create product
    const product = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(product);

    return this.findById(savedProduct.id);
  }

  /**
   * Find all products with pagination and filters
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedProductsResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      categoryType,
      unitOfMeasure,
      isActive,
      isTracked,
      lowStock,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (categoryType) {
      queryBuilder.andWhere('category.type = :categoryType', { categoryType });
    }

    if (unitOfMeasure) {
      queryBuilder.andWhere('product.unitOfMeasure = :unitOfMeasure', {
        unitOfMeasure,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (isTracked !== undefined) {
      queryBuilder.andWhere('product.isTracked = :isTracked', { isTracked });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.sellingPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.sellingPrice <= :maxPrice', { maxPrice });
    }

    if (lowStock) {
      queryBuilder
        .leftJoin('stock', 's', 's.productId = product.id')
        .andWhere('product.reorderLevel IS NOT NULL')
        .groupBy('product.id')
        .addGroupBy('category.id')
        .having('COALESCE(SUM(s.quantity), 0) <= product.reorderLevel');
    }

    // Apply sorting
    const allowedSortFields = [
      'createdAt',
      'name',
      'sku',
      'standardCost',
      'sellingPrice',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

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
   * Find product by ID
   */
  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<Product> {
    const product = await this.productsRepository.findBySku(sku);

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  /**
   * Update product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    // Validate category if being changed
    if (updateProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    // Validate pricing
    const newSellingPrice = updateProductDto.sellingPrice ?? product.sellingPrice;
    const newStandardCost = updateProductDto.standardCost ?? product.standardCost;

    if (newSellingPrice && newSellingPrice < newStandardCost) {
      throw new BadRequestException(
        'Selling price cannot be less than standard cost',
      );
    }

    // Update product
    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productsRepository.save(product);

    return this.findById(updatedProduct.id);
  }

  /**
   * Delete product (soft delete)
   */
  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productsRepository.softDelete(id);
  }

  /**
   * Restore soft deleted product
   */
  async restore(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (!product.deletedAt) {
      throw new BadRequestException('Product is not deleted');
    }

    await this.productsRepository.restore(id);
    return this.findById(id);
  }

  /**
   * Activate product
   */
  async activate(id: string): Promise<Product> {
    const product = await this.findById(id);
    product.isActive = true;
    await this.productsRepository.save(product);
    return this.findById(id);
  }

  /**
   * Deactivate product
   */
  async deactivate(id: string): Promise<Product> {
    const product = await this.findById(id);
    product.isActive = false;
    await this.productsRepository.save(product);
    return this.findById(id);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    return this.productsRepository.findLowStockProducts();
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, limit?: number): Promise<Product[]> {
    return this.productsRepository.searchProducts(searchTerm, limit);
  }

  /**
   * Get products by category
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return this.productsRepository.findByCategory(categoryId);
  }

  /**
   * Bulk update prices
   */
  async bulkUpdatePrices(
    bulkUpdateDto: BulkUpdatePricesDto,
  ): Promise<BulkUpdatePricesResponseDto> {
    const response: BulkUpdatePricesResponseDto = {
      updated: 0,
      failed: 0,
      productIds: [],
      errors: [],
    };

    for (const item of bulkUpdateDto.products) {
      try {
        const product = await this.findById(item.productId);

        if (item.standardCost !== undefined) {
          product.standardCost = item.standardCost;
        }

        if (item.sellingPrice !== undefined) {
          product.sellingPrice = item.sellingPrice;
        }

        // Validate pricing
        if (
          product.sellingPrice &&
          product.sellingPrice < product.standardCost
        ) {
          throw new BadRequestException(
            'Selling price cannot be less than standard cost',
          );
        }

        await this.productsRepository.save(product);
        response.updated++;
        response.productIds.push(item.productId);
      } catch (error) {
        response.failed++;
        response.errors.push({
          productId: item.productId,
          error: error.message,
        });
      }
    }

    return response;
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(): Promise<ProductStatistics> {
    const [
      totalProducts,
      activeProducts,
      trackedProducts,
      productsByCategory,
      productsByUnit,
      averagePrices,
      lowStockProducts,
    ] = await Promise.all([
      this.productsRepository.count({ where: { deletedAt: IsNull() } }),
      this.productsRepository.count({
        where: { isActive: true, deletedAt: IsNull() },
      }),
      this.productsRepository.count({
        where: { isTracked: true, deletedAt: IsNull() },
      }),
      this.productsRepository.getProductStatisticsByCategory(),
      this.productsRepository.getProductStatisticsByUnit(),
      this.productsRepository.getAveragePrices(),
      this.productsRepository.findLowStockProducts(),
    ]);

    const inactiveProducts = totalProducts - activeProducts;

    // Calculate average profit margin
    const products = await this.productsRepository.find({
      where: { deletedAt: IsNull(), sellingPrice: Not(IsNull()) },
    });

    const totalMargin = products.reduce(
      (sum, p) => sum + (p.profitMargin || 0),
      0,
    );
    const averageProfitMargin =
      products.length > 0 ? totalMargin / products.length : 0;

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      trackedProducts,
      productsByCategory: productsByCategory.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryType: item.categoryType,
        count: parseInt(item.count),
      })),
      productsByUnitOfMeasure: productsByUnit.map((item) => ({
        unitOfMeasure: item.unitOfMeasure,
        count: parseInt(item.count),
      })),
      averageStandardCost: parseFloat(averagePrices.avgStandardCost || '0'),
      averageSellingPrice: parseFloat(averagePrices.avgSellingPrice || '0'),
      averageProfitMargin: parseFloat(averageProfitMargin.toFixed(2)),
      lowStockProducts: lowStockProducts.length,
    };
  }

  /**
   * Duplicate product
   */
  async duplicate(id: string, newSku: string, newName?: string): Promise<Product> {
    const originalProduct = await this.findById(id);

    // Check if new SKU is unique
    const skuExists = await this.productsRepository.isSkuTaken(newSku);
    if (skuExists) {
      throw new ConflictException(`Product with SKU ${newSku} already exists`);
    }

    // Create duplicate
    const duplicateProduct = this.productsRepository.create({
      ...originalProduct,
      id: undefined,
      sku: newSku,
      name: newName || `${originalProduct.name} (Copy)`,
      barcode: null, // Clear barcode to avoid conflicts
      createdAt: undefined,
      updatedAt: undefined,
    });

    const savedProduct = await this.productsRepository.save(duplicateProduct);
    return this.findById(savedProduct.id);
  }
}

// Missing import
import { Not } from 'typeorm';