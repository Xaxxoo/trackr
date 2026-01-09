import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from './warehouse.entity';

export enum LocationType {
  RACK = 'RACK',
  SHELF = 'SHELF',
  BIN = 'BIN',
  FLOOR = 'FLOOR',
  PALLET = 'PALLET',
  COLD_STORAGE = 'COLD_STORAGE',
}

@Entity('warehouse_locations')
@Index(['warehouseId', 'code'], { unique: true })
@Index(['warehouseId'])
@Index(['type'])
@Index(['isActive'])
export class WarehouseLocation {
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
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.locations)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({
    description: 'Location code',
    example: 'A-01-01',
  })
  @Column({ length: 50 })
  code: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Aisle A, Row 1, Shelf 1',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Location type',
    enum: LocationType,
    example: LocationType.SHELF,
  })
  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.SHELF,
  })
  type: LocationType;

  @ApiProperty({
    description: 'Aisle',
    example: 'A',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  aisle: string | null;

  @ApiProperty({
    description: 'Row',
    example: '01',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  row: string | null;

  @ApiProperty({
    description: 'Level',
    example: '01',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  level: string | null;

  @ApiProperty({
    description: 'Position',
    example: '01',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  position: string | null;

  @ApiProperty({
    description: 'Maximum capacity',
    example: 100,
    required: false,
  })
  @Column({
    name: 'max_capacity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxCapacity: number | null;

  @ApiProperty({
    description: 'Current capacity used',
    example: 75,
  })
  @Column({
    name: 'current_capacity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  currentCapacity: number;

  @ApiProperty({
    description: 'Capacity utilization percentage',
    example: 75,
  })
  get capacityUtilization(): number | null {
    if (!this.maxCapacity || this.maxCapacity === 0) return null;
    return (this.currentCapacity / this.maxCapacity) * 100;
  }

  @ApiProperty({
    description: 'Whether location is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether location is occupied',
    example: true,
  })
  @Column({ name: 'is_occupied', default: false })
  isOccupied: boolean;

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

  @OneToMany('Stock', 'location')
  stock: any[];
}