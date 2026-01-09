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
import { Warehouse } from './warehouse.entity';
import { WarehouseLocation } from './warehouse-location.entity';

export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  QUARANTINE = 'QUARANTINE',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
}

@Entity('stock')
@Index(['warehouseId', 'productId'], { unique: true })
@Index(['warehouseId'])
@Index(['productId'])
@Index(['locationId'])
@Index(['status'])
export class Stock {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Warehouse details',
  })
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stock, { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({
    description: 'Product ID (can be raw material or finished good)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Location ID',
    required: false,
  })
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string | null;

  @ApiProperty({
    description: 'Location details',
  })
  @ManyToOne(() => WarehouseLocation, (location) => location.stock, { eager: true })
  @JoinColumn({ name: 'location_id' })
  location: WarehouseLocation | null;

  @ApiProperty({
    description: 'Total quantity',
    example: 1000,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Available quantity',
    example: 850,
  })
  @Column({
    name: 'available_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  availableQuantity: number;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 150,
  })
  @Column({
    name: 'reserved_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  reservedQuantity: number;

  @ApiProperty({
    description: 'Quarantine quantity',
    example: 0,
  })
  @Column({
    name: 'quarantine_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  quarantineQuantity: number;

  @ApiProperty({
    description: 'Damaged quantity',
    example: 0,
  })
  @Column({
    name: 'damaged_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  damagedQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Stock status',
    enum: StockStatus,
    example: StockStatus.AVAILABLE,
  })
  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.AVAILABLE,
  })
  status: StockStatus;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 100,
    required: false,
  })
  @Column({
    name: 'min_stock_level',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minStockLevel: number | null;

  @ApiProperty({
    description: 'Maximum stock level',
    example: 5000,
    required: false,
  })
  @Column({
    name: 'max_stock_level',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxStockLevel: number | null;

  @ApiProperty({
    description: 'Reorder point',
    example: 200,
    required: false,
  })
  @Column({
    name: 'reorder_point',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  reorderPoint: number | null;

  @ApiProperty({
    description: 'Last stock count date',
    required: false,
  })
  @Column({ name: 'last_count_date', type: 'timestamp', nullable: true })
  lastCountDate: Date | null;

  @ApiProperty({
    description: 'Last movement date',
    required: false,
  })
  @Column({ name: 'last_movement_date', type: 'timestamp', nullable: true })
  lastMovementDate: Date | null;

  @ApiProperty({
    description: 'Whether stock is below reorder point',
    example: false,
  })
  get isBelowReorderPoint(): boolean {
    if (!this.reorderPoint) return false;
    return this.availableQuantity <= this.reorderPoint;
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}