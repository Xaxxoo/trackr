import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from './warehouse.entity';

export enum MovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  PRODUCTION = 'PRODUCTION',
  SCRAP = 'SCRAP',
  COUNT = 'COUNT',
}

export enum MovementStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('stock_movements')
@Index(['warehouseId'])
@Index(['productId'])
@Index(['movementType'])
@Index(['movementDate'])
@Index(['referenceNumber'])
export class StockMovement {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Movement reference number',
    example: 'MOV-2024-001',
  })
  @Column({ name: 'reference_number', length: 100 })
  referenceNumber: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Warehouse details',
  })
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.movements, { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

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
    description: 'Movement date',
  })
  @Column({ name: 'movement_date', type: 'timestamp' })
  movementDate: Date;

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
    return this.quantity * this.unitCost;
  }

  @ApiProperty({
    description: 'Reason/Notes',
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
}