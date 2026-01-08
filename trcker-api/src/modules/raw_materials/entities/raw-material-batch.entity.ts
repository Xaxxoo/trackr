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
import { RawMaterial } from './raw-material.entity';

export enum BatchStatus {
  ORDERED = 'ORDERED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  QUALITY_CHECK = 'QUALITY_CHECK',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_STOCK = 'IN_STOCK',
  CONSUMED = 'CONSUMED',
  EXPIRED = 'EXPIRED',
}

@Entity('raw_material_batches')
@Index(['batchNumber'], { unique: true })
@Index(['rawMaterialId'])
@Index(['status'])
@Index(['expiryDate'])
export class RawMaterialBatch {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Batch number',
    example: 'BATCH-2024-001',
  })
  @Column({ name: 'batch_number', unique: true, length: 100 })
  batchNumber: string;

  @ApiProperty({
    description: 'Raw material ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'raw_material_id', type: 'uuid' })
  rawMaterialId: string;

  @ApiProperty({
    description: 'Raw material details',
  })
  @ManyToOne(() => RawMaterial, { eager: true })
  @JoinColumn({ name: 'raw_material_id' })
  rawMaterial: RawMaterial;

  @ApiProperty({
    description: 'Supplier batch number',
    example: 'SUP-BATCH-123',
    required: false,
  })
  @Column({ name: 'supplier_batch_number', length: 100, nullable: true })
  supplierBatchNumber: string | null;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 1000,
  })
  @Column({
    name: 'quantity_ordered',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantityOrdered: number;

  @ApiProperty({
    description: 'Quantity received',
    example: 980,
  })
  @Column({
    name: 'quantity_received',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  quantityReceived: number;

  @ApiProperty({
    description: 'Quantity consumed',
    example: 450,
  })
  @Column({
    name: 'quantity_consumed',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  quantityConsumed: number;

  @ApiProperty({
    description: 'Quantity available',
    example: 530,
  })
  get quantityAvailable(): number {
    return this.quantityReceived - this.quantityConsumed;
  }

  @ApiProperty({
    description: 'Unit cost',
    example: 45.50,
  })
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitCost: number;

  @ApiProperty({
    description: 'Total cost',
    example: 45500.00,
  })
  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  totalCost: number;

  @ApiProperty({
    description: 'Batch status',
    enum: BatchStatus,
    example: BatchStatus.IN_STOCK,
  })
  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.ORDERED,
  })
  status: BatchStatus;

  @ApiProperty({
    description: 'Purchase order number',
    example: 'PO-2024-001',
    required: false,
  })
  @Column({ name: 'purchase_order_number', length: 100, nullable: true })
  purchaseOrderNumber: string | null;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @Column({ name: 'warehouse_id', type: 'uuid', nullable: true })
  warehouseId: string | null;

  @ApiProperty({
    description: 'Manufacturing date',
    example: '2024-01-01',
    required: false,
  })
  @Column({ name: 'manufacturing_date', type: 'date', nullable: true })
  manufacturingDate: Date | null;

  @ApiProperty({
    description: 'Expiry date',
    example: '2025-01-01',
    required: false,
  })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @ApiProperty({
    description: 'Received date',
    required: false,
  })
  @Column({ name: 'received_date', type: 'timestamp', nullable: true })
  receivedDate: Date | null;

  @ApiProperty({
    description: 'Quality check status',
    example: 'PASSED',
    required: false,
  })
  @Column({ name: 'quality_check_status', length: 50, nullable: true })
  qualityCheckStatus: string | null;

  @ApiProperty({
    description: 'Quality check notes',
    required: false,
  })
  @Column({ name: 'quality_check_notes', type: 'text', nullable: true })
  qualityCheckNotes: string | null;

  @ApiProperty({
    description: 'Quality checked by',
    required: false,
  })
  @Column({ name: 'quality_checked_by', type: 'uuid', nullable: true })
  qualityCheckedBy: string | null;

  @ApiProperty({
    description: 'Quality checked at',
    required: false,
  })
  @Column({ name: 'quality_checked_at', type: 'timestamp', nullable: true })
  qualityCheckedAt: Date | null;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed property
  @ApiProperty({
    description: 'Whether batch is expired',
    example: false,
  })
  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > new Date(this.expiryDate);
  }

  // Computed property
  @ApiProperty({
    description: 'Days until expiry',
    example: 180,
  })
  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const diff = new Date(this.expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}