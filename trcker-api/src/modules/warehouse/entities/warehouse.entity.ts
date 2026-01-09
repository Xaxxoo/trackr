import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum WarehouseType {
  MAIN = 'MAIN',
  DISTRIBUTION = 'DISTRIBUTION',
  RETAIL = 'RETAIL',
  PRODUCTION = 'PRODUCTION',
  TRANSIT = 'TRANSIT',
  QUARANTINE = 'QUARANTINE',
}

@Entity('warehouses')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['isActive'])
export class Warehouse {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Warehouse code',
    example: 'WH-001',
  })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse - Lagos',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Warehouse type',
    enum: WarehouseType,
    example: WarehouseType.MAIN,
  })
  @Column({
    type: 'enum',
    enum: WarehouseType,
    default: WarehouseType.MAIN,
  })
  type: WarehouseType;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Address',
    example: '123 Industrial Street',
  })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Lagos',
  })
  @Column({ length: 100 })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'Lagos',
  })
  @Column({ length: 100 })
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'Nigeria',
  })
  @Column({ length: 100 })
  country: string;

  @ApiProperty({
    description: 'Postal code',
    example: '100001',
    required: false,
  })
  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string | null;

  @ApiProperty({
    description: 'Warehouse manager user ID',
    required: false,
  })
  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @ApiProperty({
    description: 'Contact phone',
    example: '+234-123-456-7890',
    required: false,
  })
  @Column({ name: 'contact_phone', length: 50, nullable: true })
  contactPhone: string | null;

  @ApiProperty({
    description: 'Contact email',
    example: 'warehouse@company.com',
    required: false,
  })
  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string | null;

  @ApiProperty({
    description: 'Total capacity in square meters',
    example: 5000,
    required: false,
  })
  @Column({
    name: 'total_capacity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalCapacity: number | null;

  @ApiProperty({
    description: 'Used capacity in square meters',
    example: 3200,
  })
  @Column({
    name: 'used_capacity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  usedCapacity: number;

  @ApiProperty({
    description: 'Available capacity percentage',
    example: 36,
  })
  get availableCapacityPercentage(): number | null {
    if (!this.totalCapacity || this.totalCapacity === 0) return null;
    return ((this.totalCapacity - this.usedCapacity) / this.totalCapacity) * 100;
  }

  @ApiProperty({
    description: 'Operating hours',
    example: 'Mon-Fri: 8AM-6PM, Sat: 8AM-2PM',
    required: false,
  })
  @Column({ name: 'operating_hours', type: 'text', nullable: true })
  operatingHours: string | null;

  @ApiProperty({
    description: 'Latitude',
    example: 6.5244,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @ApiProperty({
    description: 'Longitude',
    example: 3.3792,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @ApiProperty({
    description: 'Whether warehouse is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this is the default warehouse',
    example: false,
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ApiProperty({
    description: 'Whether temperature controlled',
    example: true,
  })
  @Column({ name: 'is_temperature_controlled', default: false })
  isTemperatureControlled: boolean;

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

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany('WarehouseLocation', 'warehouse')
  locations: any[];

  @OneToMany('Stock', 'warehouse')
  stock: any[];

  @OneToMany('StockMovement', 'warehouse')
  movements: any[];
}