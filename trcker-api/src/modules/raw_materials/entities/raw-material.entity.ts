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
import { RawMaterialSupplier } from './raw-material-supplier.entity';

export enum RawMaterialType {
  COTTON = 'COTTON',
  POLYMER = 'POLYMER',
  CHEMICAL = 'CHEMICAL',
  ADHESIVE = 'ADHESIVE',
  PACKAGING = 'PACKAGING',
  OTHER = 'OTHER',
}

export enum QualityGrade {
  PREMIUM = 'PREMIUM',
  STANDARD = 'STANDARD',
  ECONOMY = 'ECONOMY',
}

@Entity('raw_materials')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['supplierId'])
@Index(['isActive'])
export class RawMaterial {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Material code',
    example: 'RM-COT-001',
  })
  @Column({ unique: true, length: 100 })
  code: string;

  @ApiProperty({
    description: 'Material name',
    example: 'Premium Cotton Fiber',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Material type',
    enum: RawMaterialType,
    example: RawMaterialType.COTTON,
  })
  @Column({
    type: 'enum',
    enum: RawMaterialType,
  })
  type: RawMaterialType;

  @ApiProperty({
    description: 'Quality grade',
    enum: QualityGrade,
    example: QualityGrade.PREMIUM,
  })
  @Column({
    name: 'quality_grade',
    type: 'enum',
    enum: QualityGrade,
    default: QualityGrade.STANDARD,
  })
  qualityGrade: QualityGrade;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Primary supplier ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @ApiProperty({
    description: 'Primary supplier details',
  })
  @ManyToOne(() => RawMaterialSupplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  primarySupplier: RawMaterialSupplier | null;

  @ApiProperty({
    description: 'Standard cost per unit',
    example: 45.50,
  })
  @Column({
    name: 'standard_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  standardCost: number;

  @ApiProperty({
    description: 'Current market price',
    example: 48.00,
    required: false,
  })
  @Column({
    name: 'current_market_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  currentMarketPrice: number | null;

  @ApiProperty({
    description: 'Reorder level',
    example: 500,
  })
  @Column({
    name: 'reorder_level',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  reorderLevel: number;

  @ApiProperty({
    description: 'Reorder quantity',
    example: 1000,
  })
  @Column({
    name: 'reorder_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  reorderQuantity: number;

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
    description: 'Lead time in days',
    example: 14,
    required: false,
  })
  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number | null;

  @ApiProperty({
    description: 'Shelf life in days',
    example: 365,
    required: false,
  })
  @Column({ name: 'shelf_life_days', type: 'int', nullable: true })
  shelfLifeDays: number | null;

  @ApiProperty({
    description: 'Storage conditions',
    example: 'Store in cool, dry place',
    required: false,
  })
  @Column({ name: 'storage_conditions', type: 'text', nullable: true })
  storageConditions: string | null;

  @ApiProperty({
    description: 'Safety requirements',
    example: 'Handle with gloves',
    required: false,
  })
  @Column({ name: 'safety_requirements', type: 'text', nullable: true })
  safetyRequirements: string | null;

  @ApiProperty({
    description: 'Specifications',
    example: 'Purity: 99%, Moisture: <1%',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  specifications: string | null;

  @ApiProperty({
    description: 'Whether material is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether material is hazardous',
    example: false,
  })
  @Column({ name: 'is_hazardous', default: false })
  isHazardous: boolean;

  @ApiProperty({
    description: 'Whether quality inspection required',
    example: true,
  })
  @Column({ name: 'requires_quality_check', default: true })
  requiresQualityCheck: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany('RawMaterialBatch', 'rawMaterial')
  batches: any[];
}