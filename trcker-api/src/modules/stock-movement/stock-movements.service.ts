import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StockMovementsRepository } from './stock-movements.repository';
import {
  CreateReceiptDto,
  CreateIssueDto,
  CreateTransferDto,
  CreateAdjustmentDto,
  CreateReservationDto,
  UpdateMovementDto,
  MovementQueryDto,
} from './dto';
import { StockMovement, MovementType, MovementStatus } from './entities/stock-movement.entity';
import { StockTransfer, TransferStatus } from './entities/stock-transfer.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { StockReservation, ReservationStatus } from './entities/stock-reservation.entity';
import { PaginatedMovementsResponse } from './interfaces/movement-response.interface';
import { MovementStatistics } from './interfaces/movement-statistics.interface';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovementsRepository)
    private readonly movementsRepository: StockMovementsRepository,
    @InjectRepository(StockTransfer)
    private readonly transfersRepository: Repository<StockTransfer>,
    @InjectRepository(StockAdjustment)
    private readonly adjustmentsRepository: Repository<StockAdjustment>,
    @InjectRepository(StockReservation)
    private readonly reservationsRepository: Repository<StockReservation>,
  ) {}

  // ==================== RECEIPTS ====================

  async createReceipt(dto: CreateReceiptDto, userId: string): Promise<StockMovement> {
    const movementNumber = await this.generateMovementNumber('REC');

    const movement = this.movementsRepository.create({
      movementNumber,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      movementType: MovementType.RECEIPT,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure,
      toLocationId: dto.toLocationId,
      batchNumber: dto.batchNumber,
      serialNumber: dto.serialNumber,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNumber: dto.referenceNumber,
      movementDate: dto.movementDate ? new Date(dto.movementDate) : new Date(),
      unitCost: dto.unitCost,
      notes: dto.notes,
      status: MovementStatus.PENDING,
      createdBy: userId,
    });

    const saved = await this.movementsRepository.save(movement);
    await this.processMovement(saved.id);
    return this.findById(saved.id);
  }

  // ==================== ISSUES ====================

  async createIssue(dto: CreateIssueDto, userId: string): Promise<StockMovement> {
    const movementNumber = await this.generateMovementNumber('ISS');

    const movement = this.movementsRepository.create({
      movementNumber,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      movementType: MovementType.ISSUE,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure,
      fromLocationId: dto.fromLocationId,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNumber: dto.referenceNumber,
      movementDate: dto.movementDate ? new Date(dto.movementDate) : new Date(),
      reason: dto.reason,
      notes: dto.notes,
      status: MovementStatus.PENDING,
      createdBy: userId,
    });

    const saved = await this.movementsRepository.save(movement);
    await this.processMovement(saved.id);
    return this.findById(saved.id);
  }

  // ==================== TRANSFERS ====================

  async createTransfer(dto: CreateTransferDto, userId: string): Promise<StockTransfer> {
    const transferNumber = await this.generateTransferNumber();

    const transfer = this.transfersRepository.create({
      transferNumber,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure,
      expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
      carrierName: dto.carrierName,
      trackingNumber: dto.trackingNumber,
      notes: dto.notes,
      status: TransferStatus.DRAFT,
      createdBy: userId,
    });

    return this.transfersRepository.save(transfer);
  }

  async approveTransfer(transferId: string, userId: string): Promise<StockTransfer> {
    const transfer = await this.transfersRepository.findOne({ where: { id: transferId } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    transfer.status = TransferStatus.APPROVED;
    return this.transfersRepository.save(transfer);
  }

  async shipTransfer(transferId: string): Promise<StockTransfer> {
    const transfer = await this.transfersRepository.findOne({ where: { id: transferId } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    transfer.status = TransferStatus.IN_TRANSIT;
    transfer.shippedDate = new Date();
    return this.transfersRepository.save(transfer);
  }

  async completeTransfer(transferId: string, userId: string): Promise<StockTransfer> {
    const transfer = await this.transfersRepository.findOne({ where: { id: transferId } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    // Create issue movement from source
    await this.createIssue({
      warehouseId: transfer.fromWarehouseId,
      productId: transfer.productId,
      quantity: transfer.quantity,
      unitOfMeasure: transfer.unitOfMeasure,
      referenceType: 'Transfer',
      referenceId: transfer.id,
      referenceNumber: transfer.transferNumber,
      reason: `Transfer to warehouse`,
    }, userId);

    // Create receipt movement at destination
    await this.createReceipt({
      warehouseId: transfer.toWarehouseId,
      productId: transfer.productId,
      quantity: transfer.quantity,
      unitOfMeasure: transfer.unitOfMeasure,
      referenceType: 'Transfer',
      referenceId: transfer.id,
      referenceNumber: transfer.transferNumber,
    }, userId);

    transfer.status = TransferStatus.COMPLETED;
    transfer.actualDeliveryDate = new Date();
    return this.transfersRepository.save(transfer);
  }

  // ==================== ADJUSTMENTS ====================

  async createAdjustment(dto: CreateAdjustmentDto, userId: string): Promise<StockAdjustment> {
    const adjustmentNumber = await this.generateAdjustmentNumber();

    // Get current stock to calculate before/after
    const currentStock = await this.getCurrentStock(dto.warehouseId, dto.productId);

    const adjustment = this.adjustmentsRepository.create({
      adjustmentNumber,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      adjustmentType: dto.adjustmentType,
      adjustmentReason: dto.adjustmentReason,
      quantityBefore: currentStock,
      quantityAfter: currentStock + Number(dto.adjustmentQuantity),
      adjustmentQuantity: dto.adjustmentQuantity,
      unitOfMeasure: dto.unitOfMeasure,
      adjustmentDate: new Date(),
      reasonDetails: dto.reasonDetails,
      notes: dto.notes,
      createdBy: userId,
    });

    const saved = await this.adjustmentsRepository.save(adjustment);

    // Create movement record
    const movementNumber = await this.generateMovementNumber('ADJ');
    const movement = this.movementsRepository.create({
      movementNumber,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      movementType: MovementType.ADJUSTMENT,
      quantity: Math.abs(Number(dto.adjustmentQuantity)),
      unitOfMeasure: dto.unitOfMeasure,
      movementDate: new Date(),
      reason: dto.reasonDetails,
      notes: dto.notes,
      referenceType: 'Adjustment',
      referenceId: saved.id,
      referenceNumber: adjustmentNumber,
      status: MovementStatus.PENDING,
      createdBy: userId,
    });

    await this.movementsRepository.save(movement);
    await this.processMovement(movement.id);

    return saved;
  }

  // ==================== RESERVATIONS ====================

  async createReservation(dto: CreateReservationDto, userId: string): Promise<StockReservation> {
    const reservationNumber = await this.generateReservationNumber();

    // Check available stock
    const availableStock = await this.getAvailableStock(dto.warehouseId, dto.productId);
    if (availableStock < Number(dto.reservedQuantity)) {
      throw new BadRequestException('Insufficient available stock for reservation');
    }

    const reservation = this.reservationsRepository.create({
      reservationNumber,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      reservedQuantity: dto.reservedQuantity,
      unitOfMeasure: dto.unitOfMeasure,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNumber: dto.referenceNumber,
      reservationDate: new Date(),
      expiryDate: new Date(dto.expiryDate),
      notes: dto.notes,
      status: ReservationStatus.ACTIVE,
      createdBy: userId,
    });

    return this.reservationsRepository.save(reservation);
  }

  async fulfillReservation(reservationId: string, quantity: number, userId: string): Promise<StockReservation> {
    const reservation = await this.reservationsRepository.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');

    if (Number(quantity) > reservation.remainingQuantity) {
      throw new BadRequestException('Cannot fulfill more than remaining quantity');
    }

    reservation.fulfilledQuantity = Number(reservation.fulfilledQuantity) + Number(quantity);

    if (reservation.remainingQuantity === 0) {
      reservation.status = ReservationStatus.FULFILLED;
    }

    return this.reservationsRepository.save(reservation);
  }

  async cancelReservation(reservationId: string): Promise<StockReservation> {
    const reservation = await this.reservationsRepository.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');

    reservation.status = ReservationStatus.CANCELLED;
    return this.reservationsRepository.save(reservation);
  }

  // ==================== GENERAL MOVEMENTS ====================

  async findAll(query: MovementQueryDto): Promise<PaginatedMovementsResponse> {
    const { page = 1, limit = 20, search, warehouseId, productId, movementType, status, dateFrom, dateTo, sortBy = 'movementDate', sortOrder = 'DESC' } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.movementsRepository
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.warehouse', 'warehouse')
      .leftJoinAndSelect('sm.product', 'product')
      .where('sm.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    if (search) queryBuilder.andWhere('sm.movementNumber ILIKE :search', { search: `%${search}%` });
    if (warehouseId) queryBuilder.andWhere('sm.warehouseId = :warehouseId', { warehouseId });
    if (productId) queryBuilder.andWhere('sm.productId = :productId', { productId });
    if (movementType) queryBuilder.andWhere('sm.movementType = :movementType', { movementType });
    if (status) queryBuilder.andWhere('sm.status = :status', { status });
    if (dateFrom && dateTo) {
      queryBuilder.andWhere('sm.movementDate BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
    }

    queryBuilder.orderBy(`sm.${sortBy}`, sortOrder);
    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<StockMovement> {
    const movement = await this.movementsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['warehouse', 'product'],
    });
    if (!movement) throw new NotFoundException(`Movement with ID ${id} not found`);
    return movement;
  }

  async approve(id: string, userId: string): Promise<StockMovement> {
    const movement = await this.findById(id);
    movement.status = MovementStatus.APPROVED;
    movement.approvedBy = userId;
    movement.approvedAt = new Date();
    return this.movementsRepository.save(movement);
  }

  async cancel(id: string): Promise<StockMovement> {
    const movement = await this.findById(id);
    if (movement.status === MovementStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed movement');
    }
    movement.status = MovementStatus.CANCELLED;
    return this.movementsRepository.save(movement);
  }

  async getStatistics(): Promise<MovementStatistics> {
    const [total, byType, byStatus, receipts, issues, quantities, activeReservations, totalReserved] = await Promise.all([
      this.movementsRepository.count({ where: { deletedAt: IsNull() } }),
      this.movementsRepository.getStatisticsByType(),
      this.movementsRepository.getStatisticsByStatus(),
      this.movementsRepository.getReceiptCount(),
      this.movementsRepository.getIssueCount(),
      this.movementsRepository.getTotalQuantities(),
      this.reservationsRepository.count({ where: { status: ReservationStatus.ACTIVE } }),
      this.reservationsRepository.createQueryBuilder('r').select('SUM(r.reservedQuantity - r.fulfilledQuantity)', 'total').where('r.status = :status', { status: ReservationStatus.ACTIVE }).getRawOne(),
    ]);

    return {
      totalMovements: total,
      movementsByType: byType.map(i => ({ type: i.type, count: parseInt(i.count), totalQuantity: parseFloat(i.totalQuantity || '0') })),
      movementsByStatus: byStatus.map(i => ({ status: i.status, count: parseInt(i.count) })),
      receiptsCount: receipts,
      issuesCount: issues,
      transfersCount: await this.transfersRepository.count(),
      adjustmentsCount: await this.adjustmentsRepository.count(),
      totalReceiptQuantity: quantities.totalReceipts,
      totalIssueQuantity: quantities.totalIssues,
      netStockChange: quantities.totalReceipts - quantities.totalIssues,
      activeReservations,
      totalReservedQuantity: parseFloat(totalReserved?.total || '0'),
    };
  }

  // ==================== HELPER METHODS ====================

  private async processMovement(movementId: string): Promise<void> {
    const movement = await this.findById(movementId);
    // Actual stock update logic would go here (integrate with stock table)
    movement.status = MovementStatus.COMPLETED;
    movement.actualDate = new Date();
    await this.movementsRepository.save(movement);
  }

  private async generateMovementNumber(prefix: string): Promise<string> {
    const count = await this.movementsRepository.count();
    return `${prefix}-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async generateTransferNumber(): Promise<string> {
    const count = await this.transfersRepository.count();
    return `TRF-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generateAdjustmentNumber(): Promise<string> {
    const count = await this.adjustmentsRepository.count();
    return `ADJ-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generateReservationNumber(): Promise<string> {
    const count = await this.reservationsRepository.count();
    return `RSV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async getCurrentStock(warehouseId: string, productId: string): Promise<number> {
    // Would integrate with Stock table
    return 100; // Placeholder
  }

  private async getAvailableStock(warehouseId: string, productId: string): Promise<number> {
    // Would integrate with Stock table
    return 100; // Placeholder
  }
}