import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AdjustmentType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  RECOUNT = 'RECOUNT',
  DAMAGE = 'DAMAGE',
  EXPIRY = 'EXPIRY',
  FOUND = 'FOUND',
  LOST = 'LOST',
}

export enum AdjustmentReason {
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DAMAGE = 'DAMAGE',
  EXPIRY = 'EXPIRY',
  THEFT = 'THEFT',
  FOUND = 'FOUND',
  OTHER = 'OTHER',
}

@Entity('stock_adjustments')
@Index(['adjustmentNumber'], { unique: true })
@Index(['warehouseId'])
@Index(['productId'])
@Index(['adjustmentDate'])
export class StockAdjustment {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Adjustment number',
    example: 'ADJ-2024-001',
  })
  @Column({ name: 'adjustment_number', unique: true, length: 100 })
  adjustmentNumber: string;

  @ApiProperty({
    description: 'Warehouse ID',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Product ID',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Adjustment type',
    enum: AdjustmentType,
    example: AdjustmentType.INCREASE,
  })
  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: AdjustmentType,
  })
  adjustmentType: AdjustmentType;

  @ApiProperty({
    description: 'Adjustment reason',
    enum: AdjustmentReason,
    example: AdjustmentReason.PHYSICAL_COUNT,
  })
  @Column({
    name: 'adjustment_reason',
    type: 'enum',
    enum: AdjustmentReason,
  })
  adjustmentReason: AdjustmentReason;

  @ApiProperty({
    description: 'Quantity before adjustment',
    example: 95,
  })
  @Column({
    name: 'quantity_before',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantityBefore: number;

  @ApiProperty({
    description: 'Quantity after adjustment',
    example: 100,
  })
  @Column({
    name: 'quantity_after',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantityAfter: number;

  @ApiProperty({
    description: 'Adjustment quantity (difference)',
    example: 5,
  })
  @Column({
    name: 'adjustment_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  adjustmentQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Adjustment date',
  })
  @Column({ name: 'adjustment_date', type: 'timestamp' })
  adjustmentDate: Date;

  @ApiProperty({
    description: 'Reason details',
  })
  @Column({ name: 'reason_details', type: 'text' })
  reasonDetails: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}