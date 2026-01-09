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

export enum BomStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OBSOLETE = 'OBSOLETE',
}

export enum BomType {
  PRODUCTION = 'PRODUCTION',
  ENGINEERING = 'ENGINEERING',
  MANUFACTURING = 'MANUFACTURING',
  SALES = 'SALES',
}

@Entity('boms')
@Index(['bomNumber'], { unique: true })
@Index(['productId'])
@Index(['status'])
@Index(['isActive'])
export class Bom {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'BOM number',
    example: 'BOM-2024-001',
  })
  @Column({ name: 'bom_number', unique: true, length: 100 })
  bomNumber: string;

  @ApiProperty({
    description: 'Product ID (finished good)',
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
    description: 'BOM name',
    example: 'Baby Diaper Medium - Standard BOM',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'BOM description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'BOM type',
    enum: BomType,
    example: BomType.PRODUCTION,
  })
  @Column({
    name: 'bom_type',
    type: 'enum',
    enum: BomType,
    default: BomType.PRODUCTION,
  })
  bomType: BomType;

  @ApiProperty({
    description: 'BOM status',
    enum: BomStatus,
    example: BomStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: BomStatus,
    default: BomStatus.DRAFT,
  })
  status: BomStatus;

  @ApiProperty({
    description: 'Version number',
    example: '1.0',
  })
  @Column({ length: 20, default: '1.0' })
  version: string;

  @ApiProperty({
    description: 'Revision number',
    example: 1,
  })
  @Column({ name: 'revision_number', type: 'int', default: 1 })
  revisionNumber: number;

  @ApiProperty({
    description: 'Base quantity for BOM (e.g., 100 units)',
    example: 100,
  })
  @Column({
    name: 'base_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 1,
  })
  baseQuantity: number;

  @ApiProperty({
    description: 'Unit of measure for base quantity',
    example: 'PIECES',
  })
  @Column({ name: 'base_unit', length: 20 })
  baseUnit: string;

  @ApiProperty({
    description: 'Total material cost',
    example: 125.50,
  })
  @Column({
    name: 'total_material_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalMaterialCost: number;

  @ApiProperty({
    description: 'Labor cost',
    example: 25.00,
    required: false,
  })
  @Column({
    name: 'labor_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  laborCost: number | null;

  @ApiProperty({
    description: 'Overhead cost',
    example: 15.00,
    required: false,
  })
  @Column({
    name: 'overhead_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  overheadCost: number | null;

  @ApiProperty({
    description: 'Total production cost',
    example: 165.50,
  })
  get totalProductionCost(): number {
    return (
      this.totalMaterialCost +
      (this.laborCost || 0) +
      (this.overheadCost || 0)
    );
  }

  @ApiProperty({
    description: 'Cost per unit',
    example: 1.655,
  })
  get costPerUnit(): number {
    if (this.baseQuantity === 0) return 0;
    return this.totalProductionCost / this.baseQuantity;
  }

  @ApiProperty({
    description: 'Effective date',
    example: '2024-01-01',
  })
  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @ApiProperty({
    description: 'Expiry date',
    example: '2024-12-31',
    required: false,
  })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @ApiProperty({
    description: 'Whether BOM is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether BOM is default for product',
    example: true,
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ApiProperty({
    description: 'Approval status',
    example: 'APPROVED',
    required: false,
  })
  @Column({ name: 'approval_status', length: 50, nullable: true })
  approvalStatus: string | null;

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

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany('BomItem', 'bom')
  items: any[];

  @OneToMany('BomVersion', 'bom')
  versions: any[];
}