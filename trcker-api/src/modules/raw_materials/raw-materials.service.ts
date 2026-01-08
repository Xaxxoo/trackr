import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RawMaterialsRepository } from './raw-materials.repository';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RawMaterialQueryDto,
  CreateBatchDto,
  ReceiveBatchDto,
  CreateSupplierDto,
} from './dto';
import { RawMaterial } from './entities/raw-material.entity';
import { RawMaterialBatch, BatchStatus } from './entities/raw-material-batch.entity';
import { RawMaterialSupplier } from './entities/raw-material-supplier.entity';
import { PaginatedRawMaterialsResponse, PaginatedBatchesResponse } from './interfaces/raw-material-response.interface';
import { RawMaterialStatistics } from './interfaces/raw-material-statistics.interface';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectRepository(RawMaterialsRepository)
    private readonly rawMaterialsRepository: RawMaterialsRepository,
    @InjectRepository(RawMaterialBatch)
    private readonly batchesRepository: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterialSupplier)
    private readonly suppliersRepository: Repository<RawMaterialSupplier>,
  ) {}

  // ==================== RAW MATERIALS ====================

  /**
   * Create raw material
   */
  async createRawMaterial(dto: CreateRawMaterialDto): Promise<RawMaterial> {
    // Check code uniqueness
    const codeExists = await this.rawMaterialsRepository.isCodeTaken(dto.code);
    if (codeExists) {
      throw new ConflictException(`Material with code ${dto.code} already exists`);
    }

    // Validate supplier if provided
    if (dto.supplierId) {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: dto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${dto.supplierId} not found`);
      }
    }

    const material = this.rawMaterialsRepository.create(dto);
    const savedMaterial = await this.rawMaterialsRepository.save(material);
    return this.findRawMaterialById(savedMaterial.id);
  }

  /**
   * Find all raw materials
   */
  async findAllRawMaterials(query: RawMaterialQueryDto): Promise<PaginatedRawMaterialsResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      qualityGrade,
      supplierId,
      isActive,
      isHazardous,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.rawMaterialsRepository
      .createQueryBuilder('rm')
      .leftJoinAndSelect('rm.primarySupplier', 'supplier')
      .where('rm.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(rm.name ILIKE :search OR rm.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('rm.type = :type', { type });
    }

    if (qualityGrade) {
      queryBuilder.andWhere('rm.qualityGrade = :qualityGrade', { qualityGrade });
    }

    if (supplierId) {
      queryBuilder.andWhere('rm.supplierId = :supplierId', { supplierId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('rm.isActive = :isActive', { isActive });
    }

    if (isHazardous !== undefined) {
      queryBuilder.andWhere('rm.isHazardous = :isHazardous', { isHazardous });
    }

    if (lowStock) {
      queryBuilder
        .leftJoin('stock', 's', 's.productId = rm.id')
        .groupBy('rm.id')
        .addGroupBy('supplier.id')
        .having('COALESCE(SUM(s.quantity), 0) <= rm.reorderLevel');
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'name', 'code', 'standardCost'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`rm.${sortField}`, sortOrder);

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
   * Find raw material by ID
   */
  async findRawMaterialById(id: string): Promise<RawMaterial> {
    const material = await this.rawMaterialsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['primarySupplier'],
    });

    if (!material) {
      throw new NotFoundException(`Raw material with ID ${id} not found`);
    }

    return material;
  }

  /**
   * Find raw material by code
   */
  async findRawMaterialByCode(code: string): Promise<RawMaterial> {
    const material = await this.rawMaterialsRepository.findByCode(code);

    if (!material) {
      throw new NotFoundException(`Raw material with code ${code} not found`);
    }

    return material;
  }

  /**
   * Update raw material
   */
  async updateRawMaterial(id: string, dto: UpdateRawMaterialDto): Promise<RawMaterial> {
    const material = await this.findRawMaterialById(id);

    // Check code uniqueness if being changed
    if (dto.code && dto.code !== material.code) {
      const codeExists = await this.rawMaterialsRepository.isCodeTaken(dto.code, id);
      if (codeExists) {
        throw new ConflictException(`Material with code ${dto.code} already exists`);
      }
    }

    // Validate supplier if being changed
    if (dto.supplierId) {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: dto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${dto.supplierId} not found`);
      }
    }

    Object.assign(material, dto);
    await this.rawMaterialsRepository.save(material);
    return this.findRawMaterialById(id);
  }

  /**
   * Delete raw material
   */
  async removeRawMaterial(id: string): Promise<void> {
    await this.findRawMaterialById(id);
    await this.rawMaterialsRepository.softDelete(id);
  }

  /**
   * Restore raw material
   */
  async restoreRawMaterial(id: string): Promise<RawMaterial> {
    const material = await this.rawMaterialsRepository.findOne({
      where: { id },
      relations: ['primarySupplier'],
    });

    if (!material) {
      throw new NotFoundException(`Raw material with ID ${id} not found`);
    }

    if (!material.deletedAt) {
      throw new BadRequestException('Material is not deleted');
    }

    await this.rawMaterialsRepository.restore(id);
    return this.findRawMaterialById(id);
  }

  /**
   * Activate/Deactivate raw material
   */
  async toggleRawMaterialStatus(id: string, isActive: boolean): Promise<RawMaterial> {
    const material = await this.findRawMaterialById(id);
    material.isActive = isActive;
    await this.rawMaterialsRepository.save(material);
    return this.findRawMaterialById(id);
  }

  /**
   * Get low stock materials
   */
  async getLowStockMaterials(): Promise<RawMaterial[]> {
    return this.rawMaterialsRepository.findLowStockMaterials();
  }

  /**
   * Get raw material statistics
   */
  async getRawMaterialStatistics(): Promise<RawMaterialStatistics> {
    const [
      totalMaterials,
      activeMaterials,
      hazardousMaterials,
      materialsByType,
      materialsByGrade,
      lowStockMaterials,
      totalInventoryValue,
      averageCost,
    ] = await Promise.all([
      this.rawMaterialsRepository.count({ where: { deletedAt: IsNull() } }),
      this.rawMaterialsRepository.count({
        where: { isActive: true, deletedAt: IsNull() },
      }),
      this.rawMaterialsRepository.count({
        where: { isHazardous: true, deletedAt: IsNull() },
      }),
      this.rawMaterialsRepository.getStatisticsByType(),
      this.rawMaterialsRepository.getStatisticsByGrade(),
      this.rawMaterialsRepository.findLowStockMaterials(),
      this.rawMaterialsRepository.calculateInventoryValue(),
      this.rawMaterialsRepository.getAverageCost(),
    ]);

    return {
      totalMaterials,
      activeMaterials,
      inactiveMaterials: totalMaterials - activeMaterials,
      hazardousMaterials,
      materialsByType: materialsByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      materialsByGrade: materialsByGrade.map((item) => ({
        grade: item.grade,
        count: parseInt(item.count),
      })),
      lowStockMaterials: lowStockMaterials.length,
      totalInventoryValue,
      averageCost,
    };
  }

  // ==================== BATCHES ====================

  /**
   * Create batch
   */
  async createBatch(dto: CreateBatchDto, userId: string): Promise<RawMaterialBatch> {
    // Verify material exists
    await this.findRawMaterialById(dto.rawMaterialId);

    // Check batch number uniqueness
    const existingBatch = await this.batchesRepository.findOne({
      where: { batchNumber: dto.batchNumber },
    });

    if (existingBatch) {
      throw new ConflictException(`Batch ${dto.batchNumber} already exists`);
    }

    // Calculate total cost
    const totalCost = dto.quantityOrdered * dto.unitCost;

    const batch = this.batchesRepository.create({
      ...dto,
      totalCost,
      createdBy: userId,
      status: BatchStatus.ORDERED,
    });

    const savedBatch = await this.batchesRepository.save(batch);
    return this.findBatchById(savedBatch.id);
  }

  /**
   * Receive batch
   */
  async receiveBatch(
    id: string,
    dto: ReceiveBatchDto,
    userId: string,
  ): Promise<RawMaterialBatch> {
    const batch = await this.findBatchById(id);

    if (batch.status !== BatchStatus.ORDERED && batch.status !== BatchStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Can only receive batches with ORDERED or IN_TRANSIT status',
      );
    }

    if (dto.quantityReceived > batch.quantityOrdered) {
      throw new BadRequestException(
        'Received quantity cannot exceed ordered quantity',
      );
    }

    batch.quantityReceived = dto.quantityReceived;
    batch.receivedDate = new Date();
    batch.notes = dto.notes || batch.notes;

    if (dto.qualityCheckStatus) {
      batch.qualityCheckStatus = dto.qualityCheckStatus;
      batch.qualityCheckNotes = dto.qualityCheckNotes;
      batch.qualityCheckedBy = userId;
      batch.qualityCheckedAt = new Date();

      if (dto.qualityCheckStatus === 'PASSED') {
        batch.status = BatchStatus.APPROVED;
      } else if (dto.qualityCheckStatus === 'FAILED') {
        batch.status = BatchStatus.REJECTED;
      } else {
        batch.status = BatchStatus.QUALITY_CHECK;
      }
    } else {
      batch.status = batch.rawMaterial.requiresQualityCheck
        ? BatchStatus.QUALITY_CHECK
        : BatchStatus.IN_STOCK;
    }

    await this.batchesRepository.save(batch);
    return this.findBatchById(id);
  }

  /**
   * Approve batch after quality check
   */
  async approveBatch(id: string, userId: string): Promise<RawMaterialBatch> {
    const batch = await this.findBatchById(id);

    if (batch.status !== BatchStatus.QUALITY_CHECK) {
      throw new BadRequestException('Can only approve batches in QUALITY_CHECK status');
    }

    batch.status = BatchStatus.APPROVED;
    batch.qualityCheckStatus = 'PASSED';
    batch.qualityCheckedBy = userId;
    batch.qualityCheckedAt = new Date();

    await this.batchesRepository.save(batch);
    return this.findBatchById(id);
  }

  /**
   * Reject batch after quality check
   */
  async rejectBatch(
    id: string,
    reason: string,
    userId: string,
  ): Promise<RawMaterialBatch> {
    const batch = await this.findBatchById(id);

    if (batch.status !== BatchStatus.QUALITY_CHECK) {
      throw new BadRequestException('Can only reject batches in QUALITY_CHECK status');
    }

    batch.status = BatchStatus.REJECTED;
    batch.qualityCheckStatus = 'FAILED';
    batch.qualityCheckNotes = reason;
    batch.qualityCheckedBy = userId;
    batch.qualityCheckedAt = new Date();

    await this.batchesRepository.save(batch);
    return this.findBatchById(id);
  }

  /**
   * Find all batches
   */
  async findAllBatches(
    rawMaterialId?: string,
    status?: BatchStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedBatchesResponse> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.batchesRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.rawMaterial', 'rawMaterial')
      .leftJoinAndSelect('rawMaterial.primarySupplier', 'supplier')
      .skip(skip)
      .take(limit)
      .orderBy('batch.createdAt', 'DESC');

    if (rawMaterialId) {
      queryBuilder.andWhere('batch.rawMaterialId = :rawMaterialId', { rawMaterialId });
    }

    if (status) {
      queryBuilder.andWhere('batch.status = :status', { status });
    }

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
   * Find batch by ID
   */
  async findBatchById(id: string): Promise<RawMaterialBatch> {
    const batch = await this.batchesRepository.findOne({
      where: { id },
      relations: ['rawMaterial', 'rawMaterial.primarySupplier'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  /**
   * Get expiring batches
   */
  async getExpiringBatches(daysThreshold: number = 30): Promise<RawMaterialBatch[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.batchesRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.rawMaterial', 'rawMaterial')
      .where('batch.expiryDate IS NOT NULL')
      .andWhere('batch.expiryDate <= :thresholdDate', { thresholdDate })
      .andWhere('batch.expiryDate > :now', { now: new Date() })
      .andWhere('batch.status IN (:...statuses)', {
        statuses: [BatchStatus.IN_STOCK, BatchStatus.APPROVED],
      })
      .orderBy('batch.expiryDate', 'ASC')
      .getMany();
  }

  /**
   * Get expired batches
   */
  async getExpiredBatches(): Promise<RawMaterialBatch[]> {
    return this.batchesRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.rawMaterial', 'rawMaterial')
      .where('batch.expiryDate IS NOT NULL')
      .andWhere('batch.expiryDate < :now', { now: new Date() })
      .andWhere('batch.status != :expiredStatus', {
        expiredStatus: BatchStatus.EXPIRED,
      })
      .getMany();
  }

  // ==================== SUPPLIERS ====================

  /**
   * Create supplier
   */
  async createSupplier(dto: CreateSupplierDto): Promise<RawMaterialSupplier> {
    // Check code uniqueness
    const existingCode = await this.suppliersRepository.findOne({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException(`Supplier with code ${dto.code} already exists`);
    }

    // Check email uniqueness
    const existingEmail = await this.suppliersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException(`Supplier with email ${dto.email} already exists`);
    }

    const supplier = this.suppliersRepository.create(dto);
    return this.suppliersRepository.save(supplier);
  }

  /**
   * Find all suppliers
   */
  async findAllSuppliers(): Promise<RawMaterialSupplier[]> {
    return this.suppliersRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Find supplier by ID
   */
  async findSupplierById(id: string): Promise<RawMaterialSupplier> {
    const supplier = await this.suppliersRepository.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Update supplier
   */
  async updateSupplier(
    id: string,
    dto: Partial<CreateSupplierDto>,
  ): Promise<RawMaterialSupplier> {
    const supplier = await this.findSupplierById(id);

    // Check code uniqueness if being changed
    if (dto.code && dto.code !== supplier.code) {
      const existingCode = await this.suppliersRepository.findOne({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(`Supplier with code ${dto.code} already exists`);
      }
    }

    // Check email uniqueness if being changed
    if (dto.email && dto.email !== supplier.email) {
      const existingEmail = await this.suppliersRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(`Supplier with email ${dto.email} already exists`);
      }
    }

    Object.assign(supplier, dto);
    return this.suppliersRepository.save(supplier);
  }
}