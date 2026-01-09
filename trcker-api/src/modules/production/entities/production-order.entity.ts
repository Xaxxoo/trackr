import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductionOrderStatus {
  PLANNED = 'PLANNED',
  SCHEDULED = 'SCHEDULED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export enum ProductionOrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('production_orders')
@Index(['orderNumber'], { unique: true })
@Index(['productId'])
@Index(['bomId'])
@Index(['status'])
@Index(['priority'])
@Index(['plannedStartDate'])
@Index(['plannedEndDate'])
export class ProductionOrder {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Production order number',
    example: 'PO-2024-001',
  })
  @Column({ name: 'order_number', unique: true, length: 100 })
  orderNumber: string;

  @ApiProperty({
    description: 'Product ID (what to produce)',
    example: '550e8400-e29b-41d4-a716-446655440001',
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
    description: 'BOM ID to use',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @Column({ name: 'bom_id', type: 'uuid', nullable: true })
  bomId: string | null;

  @ApiProperty({
    description: 'BOM details',
  })
  @ManyToOne('Bom', { eager: true })
  @JoinColumn({ name: 'bom_id' })
  bom: any;

  @ApiProperty({
    description: 'Warehouse ID for finished goods',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Quantity to produce',
    example: 1000,
  })
  @Column({
    name: 'planned_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  plannedQuantity: number;

  @ApiProperty({
    description: 'Quantity produced',
    example: 950,
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
    description: 'Quantity accepted (passed quality check)',
    example: 940,
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
    description: 'Quantity rejected',
    example: 10,
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
    description: 'Completion percentage',
    example: 95,
  })
  get completionPercentage(): number {
    if (this.plannedQuantity === 0) return 0;
    return (this.producedQuantity / this.plannedQuantity) * 100;
  }

  @ApiProperty({
    description: 'Quality yield percentage',
    example: 98.95,
  })
  get qualityYield(): number {
    if (this.producedQuantity === 0) return 0;
    return (this.acceptedQuantity / this.producedQuantity) * 100;
  }

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Production order status',
    enum: ProductionOrderStatus,
    example: ProductionOrderStatus.IN_PROGRESS,
  })
  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.PLANNED,
  })
  status: ProductionOrderStatus;

  @ApiProperty({
    description: 'Priority',
    enum: ProductionOrderPriority,
    example: ProductionOrderPriority.NORMAL,
  })
  @Column({
    type: 'enum',
    enum: ProductionOrderPriority,
    default: ProductionOrderPriority.NORMAL,
  })
  priority: ProductionOrderPriority;

  @ApiProperty({
    description: 'Planned start date',
    example: '2024-01-10',
  })
  @Column({ name: 'planned_start_date', type: 'date' })
  plannedStartDate: Date;

  @ApiProperty({
    description: 'Planned end date',
    example: '2024-01-15',
  })
  @Column({ name: 'planned_end_date', type: 'date' })
  plannedEndDate: Date;

  @ApiProperty({
    description: 'Actual start date',
    required: false,
  })
  @Column({ name: 'actual_start_date', type: 'timestamp', nullable: true })
  actualStartDate: Date | null;

  @ApiProperty({
    description: 'Actual end date',
    required: false,
  })
  @Column({ name: 'actual_end_date', type: 'timestamp', nullable: true })
  actualEndDate: Date | null;

  @ApiProperty({
    description: 'Production duration in hours',
  })
  get actualDuration(): number | null {
    if (!this.actualStartDate || !this.actualEndDate) return null;
    const diff = this.actualEndDate.getTime() - this.actualStartDate.getTime();
    return diff / (1000 * 60 * 60);
  }

  @ApiProperty({
    description: 'Reference sales order number',
    required: false,
  })
  @Column({ name: 'sales_order_number', length: 100, nullable: true })
  salesOrderNumber: string | null;

  @ApiProperty({
    description: 'Production line/work center',
    required: false,
  })
  @Column({ name: 'work_center', length: 100, nullable: true })
  workCenter: string | null;

  @ApiProperty({
    description: 'Shift',
    example: 'Morning Shift',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  shift: string | null;

  @ApiProperty({
    description: 'Estimated cost',
    example: 4500.00,
    required: false,
  })
  @Column({
    name: 'estimated_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  estimatedCost: number | null;

  @ApiProperty({
    description: 'Actual cost',
    example: 4650.00,
    required: false,
  })
  @Column({
    name: 'actual_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  actualCost: number | null;

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

  @OneToMany('ProductionBatch', 'productionOrder')
  batches: any[];

  @OneToMany('MaterialConsumption', 'productionOrder')
  materialConsumptions: any[];
}