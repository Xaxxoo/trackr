import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductionRepository } from './production.repository';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrderQueryDto,
  StartProductionDto,
  CompleteProductionDto,
  RecordConsumptionDto,
} from './dto';
import { ProductionOrder, ProductionOrderStatus } from './entities/production-order.entity';
import { ProductionBatch, BatchStatus } from './entities/production-batch.entity';
import { MaterialConsumption } from './entities/material-consumption.entity';
import { PaginatedProductionOrdersResponse } from './interfaces/production-response.interface';
import { ProductionStatistics } from './interfaces/production-statistics.interface';
import {
  MaterialVarianceReport,
  ProductionEfficiencyReport,
} from './interfaces/production-analysis.interface';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionRepository)
    private readonly productionRepository: ProductionRepository,
    @InjectRepository(ProductionBatch)
    private readonly batchesRepository: Repository<ProductionBatch>,
    @InjectRepository(MaterialConsumption)
    private readonly consumptionRepository: Repository<MaterialConsumption>,
  ) {}

  // ==================== PRODUCTION ORDERS ====================

  /**
   * Create production order
   */
  async create(dto: CreateProductionOrderDto, userId: string): Promise<ProductionOrder> {
    // Check order number uniqueness
    const orderExists = await this.productionRepository.isOrderNumberTaken(
      dto.orderNumber,
    );
    if (orderExists) {
      throw new ConflictException(`Order ${dto.orderNumber} already exists`);
    }

    // Validate dates
    if (new Date(dto.plannedEndDate) < new Date(dto.plannedStartDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // If BOM not provided, get default BOM for product
    let bomId = dto.bomId;
    if (!bomId) {
      // This would fetch default BOM from BOM service
      // bomId = await this.getDefaultBomForProduct(dto.productId);
    }

    const order = this.productionRepository.create({
      ...dto,
      bomId,
      createdBy: userId,
      status: ProductionOrderStatus.PLANNED,
    });

    // Calculate estimated cost from BOM if available
    if (bomId) {
      // order.estimatedCost = await this.calculateEstimatedCost(bomId, dto.plannedQuantity);
    }

    const savedOrder = await this.productionRepository.save(order);
    return this.findById(savedOrder.id);
  }

  /**
   * Find all production orders
   */
  async findAll(query: ProductionOrderQueryDto): Promise<PaginatedProductionOrdersResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      productId,
      status,
      priority,
      workCenter,
      startDateFrom,
      startDateTo,
      sortBy = 'plannedStartDate',
      sortOrder = 'ASC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.productionRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.bom', 'bom')
      .where('po.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere('po.orderNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (productId) {
      queryBuilder.andWhere('po.productId = :productId', { productId });
    }

    if (status) {
      queryBuilder.andWhere('po.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('po.priority = :priority', { priority });
    }

    if (workCenter) {
      queryBuilder.andWhere('po.workCenter = :workCenter', { workCenter });
    }

    if (startDateFrom) {
      queryBuilder.andWhere('po.plannedStartDate >= :startDateFrom', {
        startDateFrom,
      });
    }

    if (startDateTo) {
      queryBuilder.andWhere('po.plannedStartDate <= :startDateTo', {
        startDateTo,
      });
    }

    // Apply sorting
    const allowedSortFields = [
      'plannedStartDate',
      'plannedEndDate',
      'orderNumber',
      'priority',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'plannedStartDate';
    queryBuilder.orderBy(`po.${sortField}`, sortOrder);

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
   * Find production order by ID
   */
  async findById(id: string): Promise<ProductionOrder> {
    const order = await this.productionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product', 'bom', 'batches', 'materialConsumptions'],
    });

    if (!order) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Update production order
   */
  async update(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status === ProductionOrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed order');
    }

    if (dto.plannedStartDate && dto.plannedEndDate) {
      if (new Date(dto.plannedEndDate) < new Date(dto.plannedStartDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(order, dto);
    await this.productionRepository.save(order);
    return this.findById(id);
  }

  /**
   * Delete production order
   */
  async remove(id: string): Promise<void> {
    const order = await this.findById(id);

    if (order.status === ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete order in progress');
    }

    await this.productionRepository.softDelete(id);
  }

  /**
   * Release production order
   */
  async release(id: string, userId: string): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.PLANNED) {
      throw new BadRequestException('Only planned orders can be released');
    }

    if (!order.bomId) {
      throw new BadRequestException('Cannot release order without BOM');
    }

    order.status = ProductionOrderStatus.RELEASED;
    order.approvedBy = userId;
    order.approvedAt = new Date();

    await this.productionRepository.save(order);
    return this.findById(id);
  }

  /**
   * Start production
   */
  async startProduction(
    id: string,
    dto: StartProductionDto,
    userId: string,
  ): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.RELEASED) {
      throw new BadRequestException('Only released orders can be started');
    }

    order.status = ProductionOrderStatus.IN_PROGRESS;
    order.actualStartDate = new Date();

    if (dto.workCenter) order.workCenter = dto.workCenter;
    if (dto.shift) order.shift = dto.shift;
    if (dto.notes) order.notes = dto.notes;

    await this.productionRepository.save(order);

    // Create initial batch if needed
    await this.createBatch(id, order.plannedQuantity, userId);

    return this.findById(id);
  }

  /**
   * Complete production
   */
  async completeProduction(
    id: string,
    dto: CompleteProductionDto,
    userId: string,
  ): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress orders can be completed');
    }

    if (dto.producedQuantity !== dto.acceptedQuantity + dto.rejectedQuantity) {
      throw new BadRequestException(
        'Produced quantity must equal accepted + rejected',
      );
    }

    order.producedQuantity = dto.producedQuantity;
    order.acceptedQuantity = dto.acceptedQuantity;
    order.rejectedQuantity = dto.rejectedQuantity;
    order.status = ProductionOrderStatus.COMPLETED;
    order.actualEndDate = new Date();

    if (dto.notes) order.notes = dto.notes;

    // Calculate actual cost
    const materialCosts = await this.consumptionRepository
      .createQueryBuilder('mc')
      .select('SUM(mc.actualQuantity * mc.unitCost)', 'totalCost')
      .where('mc.productionOrderId = :orderId', { orderId: id })
      .getRawOne();

    order.actualCost = parseFloat(materialCosts?.totalCost || '0');

    await this.productionRepository.save(order);
    return this.findById(id);
  }

  /**
   * Hold production
   */
  async holdProduction(id: string, reason: string): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only hold in-progress orders');
    }

    order.status = ProductionOrderStatus.ON_HOLD;
    order.notes = reason;

    await this.productionRepository.save(order);
    return this.findById(id);
  }

  /**
   * Resume production
   */
  async resumeProduction(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.ON_HOLD) {
      throw new BadRequestException('Can only resume on-hold orders');
    }

    order.status = ProductionOrderStatus.IN_PROGRESS;
    await this.productionRepository.save(order);
    return this.findById(id);
  }

  /**
   * Cancel production order
   */
  async cancel(id: string, reason: string): Promise<ProductionOrder> {
    const order = await this.findById(id);

    if (order.status === ProductionOrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    order.status = ProductionOrderStatus.CANCELLED;
    order.notes = reason;

    await this.productionRepository.save(order);
    return this.findById(id);
  }

  // ==================== BATCHES ====================

  /**
   * Create batch
   */
  async createBatch(
    productionOrderId: string,
    quantity: number,
    userId: string,
  ): Promise<ProductionBatch> {
    const order = await this.findById(productionOrderId);

    const batchNumber = await this.generateBatchNumber(order.orderNumber);

    const batch = this.batchesRepository.create({
      batchNumber,
      productionOrderId,
      batchQuantity: quantity,
      status: BatchStatus.PLANNED,
    });

    return this.batchesRepository.save(batch);
  }

  /**
   * Get batches for order
   */
  async getBatches(productionOrderId: string): Promise<ProductionBatch[]> {
    return this.batchesRepository.find({
      where: { productionOrderId },
      order: { createdAt: 'ASC' },
    });
  }

  // ==================== MATERIAL CONSUMPTION ====================

  /**
   * Record material consumption
   */
  async recordConsumption(
    productionOrderId: string,
    dto: RecordConsumptionDto,
    userId: string,
  ): Promise<MaterialConsumption> {
    const order = await this.findById(productionOrderId);

    if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Can only record consumption for in-progress orders',
      );
    }

    // Get material details (would fetch from RawMaterial or Product)
    const materialDetails = await this.getMaterialDetails(
      dto.materialType,
      dto.materialId,
    );

    // Get planned quantity from BOM
    const plannedQuantity = await this.getPlannedQuantityFromBom(
      order.bomId,
      dto.materialId,
      order.plannedQuantity,
    );

    const consumption = this.consumptionRepository.create({
      productionOrderId,
      ...dto,
      materialCode: materialDetails.code,
      materialName: materialDetails.name,
      plannedQuantity: plannedQuantity || dto.actualQuantity,
      unitCost: materialDetails.cost,
      consumedBy: userId,
      consumedAt: new Date(),
    });

    return this.consumptionRepository.save(consumption);
  }

  /**
   * Get material consumptions
   */
  async getConsumptions(productionOrderId: string): Promise<MaterialConsumption[]> {
    return this.consumptionRepository.find({
      where: { productionOrderId },
      order: { consumedAt: 'DESC' },
    });
  }

  /**
   * Get material variance report
   */
  async getMaterialVarianceReport(
    productionOrderId: string,
  ): Promise<MaterialVarianceReport[]> {
    const consumptions = await this.getConsumptions(productionOrderId);

    const report = consumptions.reduce((acc, item) => {
      const existing = acc.find((r) => r.materialId === item.materialId);

      if (existing) {
        existing.totalPlanned += item.plannedQuantity;
        existing.totalActual += item.actualQuantity;
        existing.totalCost += item.totalCost;
      } else {
        acc.push({
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          totalPlanned: item.plannedQuantity,
          totalActual: item.actualQuantity,
          totalVariance: item.variance,
          variancePercentage: item.variancePercentage,
          totalCost: item.totalCost,
          unitOfMeasure: item.unitOfMeasure,
        });
      }

      return acc;
    }, [] as MaterialVarianceReport[]);

    // Recalculate totals
    report.forEach((item) => {
      item.totalVariance = item.totalActual - item.totalPlanned;
      item.variancePercentage =
        item.totalPlanned > 0
          ? (item.totalVariance / item.totalPlanned) * 100
          : 0;
    });

    return report;
  }

  // ==================== STATISTICS ====================

  /**
   * Get production statistics
   */
  async getStatistics(): Promise<ProductionStatistics> {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      ordersByStatus,
      ordersByPriority,
      quantities,
      avgYield,
      avgCompletion,
    ] = await Promise.all([
      this.productionRepository.count({ where: { deletedAt: IsNull() } }),
      this.productionRepository.count({
        where: {
          status: In([
            ProductionOrderStatus.SCHEDULED,
            ProductionOrderStatus.RELEASED,
            ProductionOrderStatus.IN_PROGRESS,
          ]),
          deletedAt: IsNull(),
        },
      }),
      this.productionRepository.count({
        where: {
          status: ProductionOrderStatus.COMPLETED,
          deletedAt: IsNull(),
        },
      }),
      this.productionRepository.getStatisticsByStatus(),
      this.productionRepository.getStatisticsByPriority(),
      this.productionRepository.getProductionQuantities(),
      this.productionRepository.getAverageQualityYield(),
      this.productionRepository.getAverageCompletionRate(),
    ]);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      ordersByStatus: ordersByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      ordersByPriority: ordersByPriority.map((item) => ({
        priority: item.priority,
        count: parseInt(item.count),
      })),
      totalPlannedQuantity: parseFloat(quantities.totalPlanned || '0'),
      totalProducedQuantity: parseFloat(quantities.totalProduced || '0'),
      totalAcceptedQuantity: parseFloat(quantities.totalAccepted || '0'),
      averageQualityYield: avgYield,
      averageCompletionRate: avgCompletion,
    };
  }

  // ==================== HELPER METHODS ====================

  private async generateBatchNumber(orderNumber: string): Promise<string> {
    const count = await this.batchesRepository.count();
    return `${orderNumber}-B${(count + 1).toString().padStart(3, '0')}`;
  }

  private async getMaterialDetails(
    materialType: string,
    materialId: string,
  ): Promise<any> {
    // This would fetch from RawMaterial or Product repository
    return {
      code: 'MATERIAL-CODE',
      name: 'Material Name',
      cost: 45.50,
    };
  }

  private async getPlannedQuantityFromBom(
    bomId: string | null,
    materialId: string,
    productionQuantity: number,
  ): Promise<number | null> {
    if (!bomId) return null;
    // This would fetch from BOM items and calculate based on production quantity
    return 50;
  }
}

// Missing import
import { In } from 'typeorm';