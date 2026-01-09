import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BomRepository } from './bom.repository';
import {
  CreateBomDto,
  UpdateBomDto,
  BomQueryDto,
  AddBomItemDto,
  UpdateBomItemDto,
  CreateBomVersionDto,
} from './dto';
import { Bom, BomStatus } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { BomVersion, VersionChangeType } from './entities/bom-version.entity';
import {
  PaginatedBomsResponse,
  BomWithItemsResponse,
  BomExplosionResponse,
  BomExplosionItem,
} from './interfaces/bom-response.interface';
import { BomCostAnalysis, BomCostBreakdown } from './interfaces/bom-cost-analysis.interface';
import { BomStatistics } from './interfaces/bom-statistics.interface';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BomRepository)
    private readonly bomRepository: BomRepository,
    @InjectRepository(BomItem)
    private readonly bomItemsRepository: Repository<BomItem>,
    @InjectRepository(BomVersion)
    private readonly bomVersionsRepository: Repository<BomVersion>,
  ) {}

  // ==================== BOM CRUD ====================

  /**
   * Create BOM
   */
  async create(dto: CreateBomDto, userId: string): Promise<Bom> {
    // Check BOM number uniqueness
    const bomExists = await this.bomRepository.isBomNumberTaken(dto.bomNumber);
    if (bomExists) {
      throw new ConflictException(`BOM ${dto.bomNumber} already exists`);
    }

    // If set as default, unset other defaults for this product
    if (dto.isDefault) {
      await this.bomRepository.update(
        { productId: dto.productId, isDefault: true },
        { isDefault: false },
      );
    }

    const bom = this.bomRepository.create({
      ...dto,
      createdBy: userId,
      status: BomStatus.DRAFT,
    });

    const savedBom = await this.bomRepository.save(bom);
    return this.findById(savedBom.id);
  }

  /**
   * Find all BOMs
   */
  async findAll(query: BomQueryDto): Promise<PaginatedBomsResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      productId,
      bomType,
      status,
      isActive,
      isDefault,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.bomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.product', 'product')
      .where('bom.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(bom.bomNumber ILIKE :search OR bom.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (productId) {
      queryBuilder.andWhere('bom.productId = :productId', { productId });
    }

    if (bomType) {
      queryBuilder.andWhere('bom.bomType = :bomType', { bomType });
    }

    if (status) {
      queryBuilder.andWhere('bom.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('bom.isActive = :isActive', { isActive });
    }

    if (isDefault !== undefined) {
      queryBuilder.andWhere('bom.isDefault = :isDefault', { isDefault });
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'bomNumber', 'name', 'version'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`bom.${sortField}`, sortOrder);

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
   * Find BOM by ID
   */
  async findById(id: string): Promise<Bom> {
    const bom = await this.bomRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product', 'items'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    return bom;
  }

  /**
   * Find BOM by number
   */
  async findByBomNumber(bomNumber: string): Promise<Bom> {
    const bom = await this.bomRepository.findByBomNumber(bomNumber);

    if (!bom) {
      throw new NotFoundException(`BOM ${bomNumber} not found`);
    }

    return bom;
  }

  /**
   * Update BOM
   */
  async update(id: string, dto: UpdateBomDto): Promise<Bom> {
    const bom = await this.findById(id);

    // If setting as default, unset other defaults
    if (dto.isDefault && !bom.isDefault) {
      await this.bomRepository.update(
        { productId: bom.productId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(bom, dto);
    await this.bomRepository.save(bom);
    return this.findById(id);
  }

  /**
   * Delete BOM
   */
  async remove(id: string): Promise<void> {
    const bom = await this.findById(id);
    
    if (bom.isDefault) {
      throw new BadRequestException('Cannot delete default BOM');
    }

    await this.bomRepository.softDelete(id);
  }

  /**
   * Restore BOM
   */
  async restore(id: string): Promise<Bom> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (!bom.deletedAt) {
      throw new BadRequestException('BOM is not deleted');
    }

    await this.bomRepository.restore(id);
    return this.findById(id);
  }

  /**
   * Activate BOM
   */
  async activate(id: string): Promise<Bom> {
    const bom = await this.findById(id);
    
    // Validate BOM has items
    if (!bom.items || bom.items.length === 0) {
      throw new BadRequestException('Cannot activate BOM without items');
    }

    bom.status = BomStatus.ACTIVE;
    bom.isActive = true;
    await this.bomRepository.save(bom);
    return this.findById(id);
  }

  /**
   * Deactivate BOM
   */
  async deactivate(id: string): Promise<Bom> {
    const bom = await this.findById(id);
    bom.isActive = false;
    await this.bomRepository.save(bom);
    return this.findById(id);
  }

  // ==================== BOM ITEMS ====================

  /**
   * Add item to BOM
   */
  async addItem(bomId: string, dto: AddBomItemDto): Promise<BomItem> {
    const bom = await this.findById(bomId);

    if (bom.status === BomStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify active BOM. Create a new version instead.');
    }

    // Get item details (raw material or product)
    // This would typically fetch from RawMaterial or Product repository
    const itemDetails = await this.getItemDetails(dto.itemType, dto.itemId);

    const bomItem = this.bomItemsRepository.create({
      ...dto,
      bomId,
      itemName: itemDetails.name,
      itemCode: itemDetails.code,
    });

    const savedItem = await this.bomItemsRepository.save(bomItem);

    // Recalculate BOM costs
    await this.recalculateBomCosts(bomId);

    return savedItem;
  }

  /**
   * Update BOM item
   */
  async updateItem(itemId: string, dto: UpdateBomItemDto): Promise<BomItem> {
    const item = await this.bomItemsRepository.findOne({
      where: { id: itemId },
      relations: ['bom'],
    });

    if (!item) {
      throw new NotFoundException(`BOM item with ID ${itemId} not found`);
    }

    if (item.bom.status === BomStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify active BOM items');
    }

    Object.assign(item, dto);
    const updatedItem = await this.bomItemsRepository.save(item);

    // Recalculate BOM costs
    await this.recalculateBomCosts(item.bomId);

    return updatedItem;
  }

  /**
   * Remove item from BOM
   */
  async removeItem(itemId: string): Promise<void> {
    const item = await this.bomItemsRepository.findOne({
      where: { id: itemId },
      relations: ['bom'],
    });

    if (!item) {
      throw new NotFoundException(`BOM item with ID ${itemId} not found`);
    }

    if (item.bom.status === BomStatus.ACTIVE) {
      throw new BadRequestException('Cannot remove items from active BOM');
    }

    const bomId = item.bomId;
    await this.bomItemsRepository.remove(item);

    // Recalculate BOM costs
    await this.recalculateBomCosts(bomId);
  }

  /**
   * Get BOM items
   */
  async getBomItems(bomId: string): Promise<BomItem[]> {
    return this.bomItemsRepository.find({
      where: { bomId },
      order: { sequenceNumber: 'ASC' },
    });
  }

  // ==================== BOM VERSIONS ====================

  /**
   * Create new version
   */
  async createVersion(
    bomId: string,
    dto: CreateBomVersionDto,
    userId: string,
  ): Promise<Bom> {
    const currentBom = await this.findById(bomId);

    // Create version snapshot
    const snapshot = {
      bom: currentBom,
      items: currentBom.items,
    };

    const version = this.bomVersionsRepository.create({
      bomId,
      versionNumber: currentBom.version,
      revisionNumber: currentBom.revisionNumber,
      changeType: dto.changeType,
      changeDescription: dto.changeDescription,
      snapshot,
      createdBy: userId,
    });

    await this.bomVersionsRepository.save(version);

    // Update BOM version
    const newVersion = this.incrementVersion(
      currentBom.version,
      dto.changeType,
    );
    currentBom.version = newVersion;
    currentBom.revisionNumber += 1;
    currentBom.status = BomStatus.DRAFT;

    await this.bomRepository.save(currentBom);
    return this.findById(bomId);
  }

  /**
   * Get BOM versions
   */
  async getBomVersions(bomId: string): Promise<BomVersion[]> {
    return this.bomVersionsRepository.find({
      where: { bomId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Restore version
   */
  async restoreVersion(versionId: string, userId: string): Promise<Bom> {
    const version = await this.bomVersionsRepository.findOne({
      where: { id: versionId },
    });

    if (!version) {
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    }

    // Create new version from current state first
    await this.createVersion(
      version.bomId,
      {
        changeType: VersionChangeType.MAJOR,
        changeDescription: `Restored from version ${version.versionNumber}`,
      },
      userId,
    );

    // Restore snapshot data
    const bom = await this.findById(version.bomId);
    const snapshotBom = version.snapshot.bom;

    // Update BOM with snapshot data
    Object.assign(bom, {
      name: snapshotBom.name,
      description: snapshotBom.description,
      baseQuantity: snapshotBom.baseQuantity,
      laborCost: snapshotBom.laborCost,
      overheadCost: snapshotBom.overheadCost,
      status: BomStatus.DRAFT,
    });

    await this.bomRepository.save(bom);

    // Delete current items
    await this.bomItemsRepository.delete({ bomId: bom.id });

    // Restore items from snapshot
    const snapshotItems = version.snapshot.items;
    for (const snapshotItem of snapshotItems) {
      const item = this.bomItemsRepository.create({
        bomId: bom.id,
        ...snapshotItem,
        id: undefined,
      });
      await this.bomItemsRepository.save(item);
    }

    await this.recalculateBomCosts(bom.id);
    return this.findById(bom.id);
  }

  // ==================== BOM ANALYSIS ====================

  /**
   * Get cost analysis
   */
  async getCostAnalysis(bomId: string): Promise<BomCostAnalysis> {
    const bom = await this.findById(bomId);

    const breakdown: BomCostBreakdown = {
      materialCost: bom.totalMaterialCost,
      laborCost: bom.laborCost || 0,
      overheadCost: bom.overheadCost || 0,
      totalCost: bom.totalProductionCost,
      costPerUnit: bom.costPerUnit,
    };

    // Group by category (would need category info from items)
    const byCategory = await this.groupItemsByCategory(bom.items);

    // Get critical items (top 20% by cost)
    const criticalItems = this.getCriticalItems(bom.items);

    return {
      bomId: bom.id,
      bomNumber: bom.bomNumber,
      productName: bom.product.name,
      baseQuantity: bom.baseQuantity,
      breakdown,
      byCategory,
      criticalItems,
    };
  }

  /**
   * Get BOM explosion (multi-level BOM)
   */
  async getBomExplosion(
    bomId: string,
    quantityMultiplier: number = 1,
  ): Promise<BomExplosionResponse> {
    const bom = await this.findById(bomId);

    const explosion: BomExplosionItem[] = [];
    let totalCost = 0;

    for (const item of bom.items) {
      const explosionItem: BomExplosionItem = {
        level: 1,
        itemType: item.itemType,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity * quantityMultiplier,
        unitOfMeasure: item.unitOfMeasure,
        scrapPercentage: item.scrapPercentage,
        effectiveQuantity: item.effectiveQuantity * quantityMultiplier,
        unitCost: item.unitCost,
        totalCost: item.totalCost * quantityMultiplier,
      };

      totalCost += explosionItem.totalCost;
      explosion.push(explosionItem);
    }

    return {
      bom,
      explosion,
      totalLevels: 1,
      totalItems: explosion.length,
      totalCost,
    };
  }

  /**
   * Get BOM statistics
   */
  async getBomStatistics(): Promise<BomStatistics> {
    const [
      totalBoms,
      activeBoms,
      draftBoms,
      obsoleteBoms,
      bomsByType,
      bomsByProduct,
      averageItemsPerBom,
      averageCostPerBom,
    ] = await Promise.all([
      this.bomRepository.count({ where: { deletedAt: IsNull() } }),
      this.bomRepository.count({
        where: { status: BomStatus.ACTIVE, deletedAt: IsNull() },
      }),
      this.bomRepository.count({
        where: { status: BomStatus.DRAFT, deletedAt: IsNull() },
      }),
      this.bomRepository.count({
        where: { status: BomStatus.OBSOLETE, deletedAt: IsNull() },
      }),
      this.bomRepository.getStatisticsByType(),
      this.bomRepository.getStatisticsByProduct(),
      this.bomRepository.getAverageItemsPerBom(),
      this.bomRepository.getAverageCostPerBom(),
    ]);

    return {
      totalBoms,
      activeBoms,
      draftBoms,
      obsoleteBoms,
      bomsByType: bomsByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      bomsByProduct: bomsByProduct.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        bomCount: parseInt(item.bomCount),
      })),
      averageItemsPerBom,
      averageCostPerBom,
    };
  }

  /**
   * Approve BOM
   */
  async approve(id: string, userId: string): Promise<Bom> {
    const bom = await this.findById(id);

    if (bom.status !== BomStatus.DRAFT) {
      throw new BadRequestException('Only draft BOMs can be approved');
    }

    if (!bom.items || bom.items.length === 0) {
      throw new BadRequestException('Cannot approve BOM without items');
    }

    bom.approvalStatus = 'APPROVED';
    bom.approvedBy = userId;
    bom.approvedAt = new Date();
    bom.status = BomStatus.ACTIVE;
    bom.isActive = true;

    await this.bomRepository.save(bom);
    return this.findById(id);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Recalculate BOM costs
   */
  private async recalculateBomCosts(bomId: string): Promise<void> {
    const items = await this.getBomItems(bomId);
    const totalMaterialCost = items.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    await this.bomRepository.update(bomId, { totalMaterialCost });
  }

  /**
   * Increment version number
   */
  private incrementVersion(
    currentVersion: string,
    changeType: VersionChangeType,
  ): string {
    const parts = currentVersion.split('.').map((p) => parseInt(p));
    const [major, minor, patch] = parts.length === 3 ? parts : [...parts, 0, 0];

    switch (changeType) {
      case VersionChangeType.MAJOR:
        return `${major + 1}.0.0`;
      case VersionChangeType.MINOR:
        return `${major}.${minor + 1}.0`;
      case VersionChangeType.PATCH:
        return `${major}.${minor}.${patch + 1}`;
      default:
        return currentVersion;
    }
  }

  /**
   * Get item details (placeholder - would fetch from actual repositories)
   */
  private async getItemDetails(
    itemType: string,
    itemId: string,
  ): Promise<{ name: string; code: string }> {
    // This would fetch from RawMaterial or Product repository
    return {
      name: 'Item Name',
      code: 'ITEM-CODE',
    };
  }

  /**
   * Group items by category
   */
  private async groupItemsByCategory(items: BomItem[]): Promise<any[]> {
    // Placeholder - would group by actual categories
    return [];
  }

  /**
   * Get critical items (Pareto analysis)
   */
  private getCriticalItems(items: BomItem[]): any[] {
    const sorted = [...items].sort((a, b) => b.totalCost - a.totalCost);
    const totalCost = sorted.reduce((sum, item) => sum + item.totalCost, 0);

    return sorted.slice(0, Math.ceil(sorted.length * 0.2)).map((item) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      totalCost: item.totalCost,
      percentage: (item.totalCost / totalCost) * 100,
    }));
  }
}