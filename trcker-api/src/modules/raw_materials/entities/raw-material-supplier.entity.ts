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

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
}

export enum SupplierRating {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  POOR = 'POOR',
  UNRATED = 'UNRATED',
}

@Entity('raw_material_suppliers')
@Index(['code'], { unique: true })
@Index(['email'])
@Index(['status'])
export class RawMaterialSupplier {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Supplier code',
    example: 'SUP-001',
  })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({
    description: 'Supplier name',
    example: 'ABC Cotton Suppliers Ltd',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Smith',
    required: false,
  })
  @Column({ name: 'contact_person', length: 255, nullable: true })
  contactPerson: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'contact@abccotton.com',
  })
  @Column({ length: 255 })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  phone: string | null;

  @ApiProperty({
    description: 'Address',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address: string | null;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  country: string | null;

  @ApiProperty({
    description: 'Tax ID number',
    example: 'TAX-123456',
    required: false,
  })
  @Column({ name: 'tax_id', length: 100, nullable: true })
  taxId: string | null;

  @ApiProperty({
    description: 'Supplier status',
    enum: SupplierStatus,
    example: SupplierStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @ApiProperty({
    description: 'Supplier rating',
    enum: SupplierRating,
    example: SupplierRating.EXCELLENT,
  })
  @Column({
    type: 'enum',
    enum: SupplierRating,
    default: SupplierRating.UNRATED,
  })
  rating: SupplierRating;

  @ApiProperty({
    description: 'Payment terms in days',
    example: 30,
    required: false,
  })
  @Column({ name: 'payment_terms_days', type: 'int', nullable: true })
  paymentTermsDays: number | null;

  @ApiProperty({
    description: 'Credit limit',
    example: 100000.00,
    required: false,
  })
  @Column({
    name: 'credit_limit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  creditLimit: number | null;

  @ApiProperty({
    description: 'Current balance',
    example: 25000.00,
  })
  @Column({
    name: 'current_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Lead time in days',
    example: 14,
    required: false,
  })
  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number | null;

  @ApiProperty({
    description: 'Minimum order value',
    example: 1000.00,
    required: false,
  })
  @Column({
    name: 'minimum_order_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minimumOrderValue: number | null;

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

  @OneToMany('RawMaterial', 'primarySupplier')
  rawMaterials: any[];
}