import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TransferStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('stock_transfers')
@Index(['transferNumber'], { unique: true })
@Index(['fromWarehouseId'])
@Index(['toWarehouseId'])
@Index(['status'])
export class StockTransfer {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Transfer number',
    example: 'TRF-2024-001',
  })
  @Column({ name: 'transfer_number', unique: true, length: 100 })
  transferNumber: string;

  @ApiProperty({
    description: 'From warehouse ID',
  })
  @Column({ name: 'from_warehouse_id', type: 'uuid' })
  fromWarehouseId: string;

  @ApiProperty({
    description: 'To warehouse ID',
  })
  @Column({ name: 'to_warehouse_id', type: 'uuid' })
  toWarehouseId: string;

  @ApiProperty({
    description: 'Product ID',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

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
    description: 'Transfer status',
    enum: TransferStatus,
    example: TransferStatus.IN_TRANSIT,
  })
  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.DRAFT,
  })
  status: TransferStatus;

  @ApiProperty({
    description: 'Expected delivery date',
  })
  @Column({ name: 'expected_delivery_date', type: 'date' })
  expectedDeliveryDate: Date;

  @ApiProperty({
    description: 'Actual delivery date',
    required: false,
  })
  @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
  actualDeliveryDate: Date | null;

  @ApiProperty({
    description: 'Shipped date',
    required: false,
  })
  @Column({ name: 'shipped_date', type: 'timestamp', nullable: true })
  shippedDate: Date | null;

  @ApiProperty({
    description: 'Carrier name',
    required: false,
  })
  @Column({ name: 'carrier_name', length: 255, nullable: true })
  carrierName: string | null;

  @ApiProperty({
    description: 'Tracking number',
    required: false,
  })
  @Column({ name: 'tracking_number', length: 255, nullable: true })
  trackingNumber: string | null;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}