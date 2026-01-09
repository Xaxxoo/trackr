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
import { ProductionOrder } from './production-order.entity';

export enum BatchStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  QUALITY_CHECK = 'QUALITY_CHECK',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('production_batches')
@Index(['batchNumber'], { unique: true })
@Index(['productionOrderId'])
@Index(['status'])
export class ProductionBatch {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Batch number',
    example: 'BATCH-PO-2024-001-01',
  })
  @Column({ name: 'batch_number', unique: true, length: 100 })
  batchNumber: string;

  @ApiProperty({
    description: 'Production order ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'production_order_id', type: 'uuid' })
  productionOrderId: string;

  @ApiProperty({
    description: 'Production order details',
  })
  @ManyToOne(() => ProductionOrder, (order) => order.batches)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @ApiProperty({
    description: 'Batch quantity',
    example: 100,
  })
  @Column({
    name: 'batch_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  batchQuantity: number;

  @ApiProperty({
    description: 'Produced quantity',
    example: 98,
  })
  @Column({
    name: 'produced_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  producedQuantity: number;

  @ApiProperty({
    description: 'Accepted quantity',
    example: 95,
  })
  @Column({
    name: 'accepted_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  acceptedQuantity: number;

  @ApiProperty({
    description: 'Rejected quantity',
    example: 3,
  })
  @Column({
    name: 'rejected_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  rejectedQuantity: number;

  @ApiProperty({
    description: 'Batch status',
    enum: BatchStatus,
    example: BatchStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.PLANNED,
  })
  status: BatchStatus;

  @ApiProperty({
    description: 'Start time',
    required: false,
  })
  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date | null;

  @ApiProperty({
    description: 'End time',
    required: false,
  })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @ApiProperty({
    description: 'Operator ID',
    required: false,
  })
  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  operatorId: string | null;

  @ApiProperty({
    description: 'Quality check notes',
    required: false,
  })
  @Column({ name: 'quality_notes', type: 'text', nullable: true })
  qualityNotes: string | null;

  @ApiProperty({
    description: 'Quality checked by',
    required: false,
  })
  @Column({ name: 'quality_checked_by', type: 'uuid', nullable: true })
  qualityCheckedBy: string | null;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Batch yield percentage',
    example: 96.94,
  })
  get yieldPercentage(): number {
    if (this.producedQuantity === 0) return 0;
    return (this.acceptedQuantity / this.producedQuantity) * 100;
  }
}