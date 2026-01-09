import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  PRODUCTION_RECEIPT = 'PRODUCTION_RECEIPT',
  PRODUCTION_ISSUE = 'PRODUCTION_ISSUE',
  SALES_ISSUE = 'SALES_ISSUE',
  PURCHASE_RECEIPT = 'PURCHASE_RECEIPT',
  SCRAP = 'SCRAP',
  CYCLE_COUNT = 'CYCLE_COUNT',
}

export enum MovementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

@Entity('stock_movements')
@Index(['movementNumber'], { unique: true })
@Index(['warehouseId'])
@Index(['productId'])
@Index(['movementType'])
@Index(['status'])
@Index(['movementDate'])
@Index(['referenceType', 'referenceId'])
export class StockMovement {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Movement number',
    example: 'MOV-2024-000001',
  })
  @Column({ name: 'movement_number', unique: true, length: 100 })
  movementNumber: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Warehouse details',
  })
  @ManyToOne('Warehouse', { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: any;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Product details',
  })
  @ManyToOne('Product', { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: any;

  @ApiProperty({
    description: 'Movement type',
    enum: MovementType,
    example: MovementType.RECEIPT,
  })
  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: MovementType,
  })
  movementType: MovementType;

  @ApiProperty({
    description: 'Movement status',
    enum: MovementStatus,
    example: MovementStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: MovementStatus,
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'From warehouse ID (for transfers)',
    required: false,
  })
  @Column({ name: 'from_warehouse_id', type: 'uuid', nullable: true })
  fromWarehouseId: string | null;

  @ApiProperty({
    description: 'To warehouse ID (for transfers)',
    required: false,
  })
  @Column({ name: 'to_warehouse_id', type: 'uuid', nullable: true })
  toWarehouseId: string | null;

  @ApiProperty({
    description: 'From location ID',
    required: false,
  })
  @Column({ name: 'from_location_id', type: 'uuid', nullable: true })
  fromLocationId: string | null;

  @ApiProperty({
    description: 'To location ID',
    required: false,
  })
  @Column({ name: 'to_location_id', type: 'uuid', nullable: true })
  toLocationId: string | null;

  @ApiProperty({
    description: 'Batch number',
    required: false,
  })
  @Column({ name: 'batch_number', length: 100, nullable: true })
  batchNumber: string | null;

  @ApiProperty({
    description: 'Serial number',
    required: false,
  })
  @Column({ name: 'serial_number', length: 100, nullable: true })
  serialNumber: string | null;

  @ApiProperty({
    description: 'Reference document type',
    example: 'PurchaseOrder',
    required: false,
  })
  @Column({ name: 'reference_type', length: 100, nullable: true })
  referenceType: string | null;

  @ApiProperty({
    description: 'Reference document ID',
    required: false,
  })
  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @ApiProperty({
    description: 'Reference document number',
    example: 'PO-2024-001',
    required: false,
  })
  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string | null;

  @ApiProperty({
    description: 'Movement date',
  })
  @Column({ name: 'movement_date', type: 'timestamp' })
  movementDate: Date;

  @ApiProperty({
    description: 'Expected date',
    required: false,
  })
  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate: Date | null;

  @ApiProperty({
    description: 'Actual date',
    required: false,
  })
  @Column({ name: 'actual_date', type: 'timestamp', nullable: true })
  actualDate: Date | null;

  @ApiProperty({
    description: 'Unit cost',
    example: 45.50,
    required: false,
  })
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  unitCost: number | null;

  @ApiProperty({
    description: 'Total cost',
    example: 4550.00,
  })
  get totalCost(): number | null {
    if (!this.unitCost) return null;
    return Number(this.quantity) * Number(this.unitCost);
  }

  @ApiProperty({
    description: 'Reason',
    example: 'Stock adjustment after physical count',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Created by user ID',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ApiProperty({
    description: 'Approved by user ID',
    required: false,
  })
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ApiProperty({
    description: 'Approval date',
    required: false,
  })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}