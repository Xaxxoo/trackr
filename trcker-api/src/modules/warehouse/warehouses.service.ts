import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { WarehousesRepository } from './warehouses.repository';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateLocationDto,
  UpdateLocationDto,
  CreateStockMovementDto,
  WarehouseQueryDto,
  StockQueryDto,
} from './dto';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Stock, StockStatus } from './entities/stock.entity';
import { StockMovement, MovementType, MovementStatus } from './entities/stock-movement.entity';
import {
  PaginatedWarehousesResponse,
  PaginatedLocationsResponse,
} from './interfaces/warehouse-response.interface';
import {
  PaginatedStockResponse,
  PaginatedMovementsResponse,
  StockSummary,
} from './interfaces/stock-response.interface';
import { WarehouseStatistics } from './interfaces/warehouse-statistics.interface';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(WarehousesRepository)
    private readonly warehousesRepository: WarehousesRepository,
    @InjectRepository(WarehouseLocation)
    private readonly locationsRepository: Repository<WarehouseLocation>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
  ) {}

  // ==================== WAREHOUSES ====================

  /**
   * Create warehouse
   */
  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    // Check code uniqueness
    const codeExists = await this.warehousesRepository.isCodeTaken(dto.code);
    if (codeExists) {
      throw new ConflictException(`Warehouse with code ${dto.code} already exists`);
    }

    // If set as default, unset other defaults
    if (dto.isDefault) {
      await this.warehousesRepository.update({ isDefault: true }, { isDefault: false });
    }

    const warehouse = this.warehousesRepository.create(dto);
    const savedWarehouse = await this.warehousesRepository.save(warehouse);
    return this.findWarehouseById(savedWarehouse.id);
  }

  /**
   * Find all warehouses
   */
  async findAllWarehouses(query: WarehouseQueryDto): Promise<PaginatedWarehousesResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      city,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.warehousesRepository
      .createQueryBuilder('wh')
      .where('wh.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere('(wh.code ILIKE :search OR wh.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere('wh.type = :type', { type });
    }

    if (city) {
      queryBuilder.andWhere('wh.city = :city', { city });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('wh.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const allowedSortFields = ['name', 'code', 'city', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`wh.${sortField}`, sortOrder);

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
   * Find warehouse by ID
   */
  async findWarehouseById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['locations', 'stock'],
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  /**
   * Update warehouse
   */
  async updateWarehouse(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findWarehouseById(id);

    // If setting as default, unset other defaults
    if (dto.isDefault && !warehouse.isDefault) {
      await this.warehousesRepository.update({ isDefault: true }, { isDefault: false });
    }

    Object.assign(warehouse, dto);
    await this.warehousesRepository.save(warehouse);
    return this.findWarehouseById(id);
  }

  /**
   * Delete warehouse
   */
  async removeWarehouse(id: string): Promise<void> {
    const warehouse = await this.findWarehouseById(id);

    // Check if warehouse has stock
    const stockCount = await this.stockRepository.count({
      where: { warehouseId: id },
    });

    if (stockCount > 0) {
      throw new BadRequestException('Cannot delete warehouse with existing stock');
    }

    if (warehouse.isDefault) {
      throw new BadRequestException('Cannot delete default warehouse');
    }

    await this.warehousesRepository.softDelete(id);
  }

  /**
   * Restore warehouse
   */
  async restoreWarehouse(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    if (!warehouse.deletedAt) {
      throw new BadRequestException('Warehouse is not deleted');
    }

    await this.warehousesRepository.restore(id);
    return this.findWarehouseById(id);
  }

  // ==================== LOCATIONS ====================

  /**
   * Create location
   */
  async createLocation(
    warehouseId: string,
    dto: CreateLocationDto,
  ): Promise<WarehouseLocation> {
    // Verify warehouse exists
    await this.findWarehouseById(warehouseId);

    // Check code uniqueness within warehouse
    const existing = await this.locationsRepository.findOne({
      where: { warehouseId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Location ${dto.code} already exists in this warehouse`,
      );
    }

    const location = this.locationsRepository.create({
      ...dto,
      warehouseId,
    });

    return this.locationsRepository.save(location);
  }

  /**
   * Get warehouse locations
   */
  async getWarehouseLocations(warehouseId: string): Promise<WarehouseLocation[]> {
    return this.locationsRepository.find({
      where: { warehouseId },
      order: { code: 'ASC' },
    });
  }

  /**
   * Update location
   */
  async updateLocation(
    locationId: string,
    dto: UpdateLocationDto,
  ): Promise<WarehouseLocation> {
    const location = await this.locationsRepository.findOne({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    Object.assign(location, dto);
    return this.locationsRepository.save(location);
  }

  /**
   * Delete location
   */
  async removeLocation(locationId: string): Promise<void> {
    const location = await this.locationsRepository.findOne({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    // Check if location has stock
    const stockCount = await this.stockRepository.count({
      where: { locationId },
    });

    if (stockCount > 0) {
      throw new BadRequestException('Cannot delete location with existing stock');
    }

    await this.locationsRepository.remove(location);
  }

  // ==================== STOCK ====================

  /**
   * Get stock
   */
  async getStock(query: StockQueryDto): Promise<PaginatedStockResponse> {
    const {
      page = 1,
      limit = 20,
      warehouseId,
      productId,
      status,
      lowStock,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .leftJoinAndSelect('stock.location', 'location')
      .skip(skip)
      .take(limit);

    if (warehouseId) {
      queryBuilder.andWhere('stock.warehouseId = :warehouseId', { warehouseId });
    }

    if (productId) {
      queryBuilder.andWhere('stock.productId = :productId', { productId });
    }

    if (status) {
      queryBuilder.andWhere('stock.status = :status', { status });
    }

    if (lowStock) {
      queryBuilder.andWhere('stock.availableQuantity <= stock.reorderPoint');
    }

    queryBuilder.orderBy('stock.createdAt', 'DESC');

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
   * Get stock by product and warehouse
   */
  async getStockByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<Stock | null> {
    return this.stockRepository.findOne({
      where: { productId, warehouseId },
      relations: ['warehouse', 'location'],
    });
  }

  /**
   * Get stock summary by product
   */
  async getStockSummaryByProduct(productId: string): Promise<StockSummary> {
    const stocks = await this.stockRepository.find({
      where: { productId },
      relations: ['warehouse'],
    });

    if (stocks.length === 0) {
      throw new NotFoundException(`No stock found for product ${productId}`);
    }

    const totalQuantity = stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
    const availableQuantity = stocks.reduce(
      (sum, s) => sum + Number(s.availableQuantity),
      0,
    );
    const reservedQuantity = stocks.reduce(
      (sum, s) => sum + Number(s.reservedQuantity),
      0,
    );
    const quarantineQuantity = stocks.reduce(
      (sum, s) => sum + Number(s.quarantineQuantity),
      0,
    );
    const damagedQuantity = stocks.reduce(
      (sum, s) => sum + Number(s.damagedQuantity),
      0,
    );

    return {
      productId,
      productCode: 'PRODUCT-CODE', // Would fetch from product service
      productName: 'Product Name', // Would fetch from product service
      totalQuantity,
      availableQuantity,
      reservedQuantity,
      quarantineQuantity,
      damagedQuantity,
      warehouses: stocks.map((s) => ({
        warehouseId: s.warehouseId,
        warehouseName: s.warehouse.name,
        quantity: Number(s.quantity),
      })),
    };
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<Stock[]> {
    return this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('stock.reorderPoint IS NOT NULL')
      .andWhere('stock.availableQuantity <= stock.reorderPoint')
      .orderBy('stock.availableQuantity', 'ASC')
      .getMany();
  }

  // ==================== STOCK MOVEMENTS ====================

  /**
   * Create stock movement
   */
  async createStockMovement(
    warehouseId: string,
    dto: CreateStockMovementDto,
    userId: string,
  ): Promise<StockMovement> {
    // Verify warehouse exists
    await this.findWarehouseById(warehouseId);

    // Generate reference number
    const referenceNumber = await this.generateMovementReference();

    const movement = this.movementsRepository.create({
      ...dto,
      referenceNumber,
      warehouseId,
      movementDate: dto.movementDate ? new Date(dto.movementDate) : new Date(),
      status: MovementStatus.PENDING,
      createdBy: userId,
    });

    const savedMovement = await this.movementsRepository.save(movement);

    // Process the movement
    await this.processStockMovement(savedMovement.id);

    return this.findMovementById(savedMovement.id);
  }

  /**
   * Process stock movement
   */
  async processStockMovement(movementId: string): Promise<void> {
    const movement = await this.findMovementById(movementId);

    if (movement.status !== MovementStatus.PENDING) {
      throw new BadRequestException('Movement already processed');
    }

    switch (movement.movementType) {
      case MovementType.RECEIPT:
        await this.processReceipt(movement);
        break;
      case MovementType.ISSUE:
        await this.processIssue(movement);
        break;
      case MovementType.ADJUSTMENT:
        await this.processAdjustment(movement);
        break;
      case MovementType.TRANSFER:
        await this.processTransfer(movement);
        break;
      default:
        throw new BadRequestException(`Unsupported movement type: ${movement.movementType}`);
    }

    // Mark as completed
    await this.movementsRepository.update(movementId, {
      status: MovementStatus.COMPLETED,
    });
  }

  /**
   * Get stock movements
   */
  async getStockMovements(
    warehouseId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedMovementsResponse> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.movementsRepository.findAndCount({
      where: { warehouseId },
      relations: ['warehouse'],
      order: { movementDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find movement by ID
   */
  async findMovementById(id: string): Promise<StockMovement> {
    const movement = await this.movementsRepository.findOne({
      where: { id },
      relations: ['warehouse'],
    });

    if (!movement) {
      throw new NotFoundException(`Movement with ID ${id} not found`);
    }

    return movement;
  }

  // ==================== STATISTICS ====================

  /**
   * Get warehouse statistics
   */
  async getStatistics(): Promise<WarehouseStatistics> {
    const [
      totalWarehouses,
      activeWarehouses,
      totalLocations,
      occupiedLocations,
      warehousesByType,
      capacity,
      lowStockItems,
    ] = await Promise.all([
      this.warehousesRepository.count({ where: { deletedAt: IsNull() } }),
      this.warehousesRepository.count({
        where: { isActive: true, deletedAt: IsNull() },
      }),
      this.locationsRepository.count(),
      this.locationsRepository.count({ where: { isOccupied: true } }),
      this.warehousesRepository.getStatisticsByType(),
      this.warehousesRepository.getTotalCapacity(),
      this.getLowStockItems(),
    ]);

    const totalCapacity = parseFloat(capacity?.totalCapacity || '0');
    const usedCapacity = parseFloat(capacity?.usedCapacity || '0');

    return {
      totalWarehouses,
      activeWarehouses,
      totalLocations,
      occupiedLocations,
      warehousesByType: warehousesByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      totalCapacity,
      usedCapacity,
      capacityUtilization: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0,
      totalStockValue: 0, // Would calculate from stock with costs
      lowStockItems: lowStockItems.length,
    };
  }

  // ==================== HELPER METHODS ====================

  private async processReceipt(movement: StockMovement): Promise<void> {
    let stock = await this.getStockByProductAndWarehouse(
      movement.productId,
      movement.warehouseId,
    );

    if (!stock) {
      // Create new stock record
      stock = this.stockRepository.create({
        warehouseId: movement.warehouseId,
        productId: movement.productId,
        quantity: movement.quantity,
        availableQuantity: movement.quantity,
        unitOfMeasure: movement.unitOfMeasure,
        status: StockStatus.AVAILABLE,
        locationId: movement.toLocationId,
      });
    } else {
      // Update existing stock
      stock.quantity = Number(stock.quantity) + Number(movement.quantity);
      stock.availableQuantity = Number(stock.availableQuantity) + Number(movement.quantity);
    }

    stock.lastMovementDate = movement.movementDate;
    await this.stockRepository.save(stock);
  }

  private async processIssue(movement: StockMovement): Promise<void> {
    const stock = await this.getStockByProductAndWarehouse(
      movement.productId,
      movement.warehouseId,
    );

    if (!stock) {
      throw new BadRequestException('Stock not found for issue');
    }

    if (Number(stock.availableQuantity) < Number(movement.quantity)) {
      throw new BadRequestException('Insufficient stock for issue');
    }

    stock.quantity = Number(stock.quantity) - Number(movement.quantity);
    stock.availableQuantity = Number(stock.availableQuantity) - Number(movement.quantity);
    stock.lastMovementDate = movement.movementDate;

    await this.stockRepository.save(stock);
  }

  private async processAdjustment(movement: StockMovement): Promise<void> {
    const stock = await this.getStockByProductAndWarehouse(
      movement.productId,
      movement.warehouseId,
    );

    if (!stock) {
      throw new BadRequestException('Stock not found for adjustment');
    }

    // Positive quantity = increase, negative = decrease
    stock.quantity = Number(stock.quantity) + Number(movement.quantity);
    stock.availableQuantity = Number(stock.availableQuantity) + Number(movement.quantity);
    stock.lastMovementDate = movement.movementDate;

    await this.stockRepository.save(stock);
  }

  private async processTransfer(movement: StockMovement): Promise<void> {
    if (!movement.fromWarehouseId || !movement.toWarehouseId) {
      throw new BadRequestException('Transfer requires from and to warehouses');
    }

    // Issue from source warehouse
    const fromStock = await this.getStockByProductAndWarehouse(
      movement.productId,
      movement.fromWarehouseId,
    );

    if (!fromStock || Number(fromStock.availableQuantity) < Number(movement.quantity)) {
      throw new BadRequestException('Insufficient stock for transfer');
    }

    fromStock.quantity = Number(fromStock.quantity) - Number(movement.quantity);
    fromStock.availableQuantity = Number(fromStock.availableQuantity) - Number(movement.quantity);
    await this.stockRepository.save(fromStock);

    // Receipt to destination warehouse
    let toStock = await this.getStockByProductAndWarehouse(
      movement.productId,
      movement.toWarehouseId,
    );

    if (!toStock) {
      toStock = this.stockRepository.create({
        warehouseId: movement.toWarehouseId,
        productId: movement.productId,
        quantity: movement.quantity,
        availableQuantity: movement.quantity,
        unitOfMeasure: movement.unitOfMeasure,
        status: StockStatus.AVAILABLE,
      });
    } else {
      toStock.quantity = Number(toStock.quantity) + Number(movement.quantity);
      toStock.availableQuantity = Number(toStock.availableQuantity) + Number(movement.quantity);
    }

    await this.stockRepository.save(toStock);
  }

  private async generateMovementReference(): Promise<string> {
    const count = await this.movementsRepository.count();
    return `MOV-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }
}