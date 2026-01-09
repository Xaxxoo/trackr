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
import { ProductCategory } from './product-category.entity';

export enum UnitOfMeasure {
  KG = 'KG',
  PIECES = 'PIECES',
  BOXES = 'BOXES',
  LITERS = 'LITERS',
  METERS = 'METERS',
  GRAMS = 'GRAMS',
  ROLLS = 'ROLLS',
  PACKS = 'PACKS',
  UNITS = 'UNITS',
}

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['categoryId'])
@Index(['name'])
@Index(['isActive'])
@Index(['createdAt'])
export class Product {
  @ApiProperty({
    description: 'Unique identifier for the product',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Stock Keeping Unit (unique product code)',
    example: 'COT-100G-001',
  })
  @Column({ unique: true, length: 100 })
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Cotton Wool 100g',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Product category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ApiProperty({
    description: 'Product category details',
  })
  @ManyToOne(() => ProductCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @ApiProperty({
    description: 'Unit of measure',
    enum: UnitOfMeasure,
    example: UnitOfMeasure.PIECES,
  })
  @Column({
    name: 'unit_of_measure',
    type: 'enum',
    enum: UnitOfMeasure,
  })
  unitOfMeasure: UnitOfMeasure;

  @ApiProperty({
    description: 'Product variant (e.g., size, color)',
    example: '100g',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  variant: string | null;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality absorbent cotton wool',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Product barcode',
    example: '1234567890123',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  barcode: string | null;

  @ApiProperty({
    description: 'Reorder level (minimum stock threshold)',
    example: 100,
    required: false,
  })
  @Column({
    name: 'reorder_level',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  reorderLevel: number | null;

  @ApiProperty({
    description: 'Maximum stock level',
    example: 1000,
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
    description: 'Standard cost per unit',
    example: 15.50,
  })
  @Column({
    name: 'standard_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  standardCost: number;

  @ApiProperty({
    description: 'Selling price per unit',
    example: 25.00,
    required: false,
  })
  @Column({
    name: 'selling_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sellingPrice: number | null;

  @ApiProperty({
    description: 'Product weight in kg',
    example: 0.1,
    required: false,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  weight: number | null;

  @ApiProperty({
    description: 'Product dimensions (L x W x H in cm)',
    example: '10 x 5 x 3',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  dimensions: string | null;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/product.jpg',
    required: false,
  })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the product is tracked in inventory',
    example: true,
  })
  @Column({ name: 'is_tracked', default: true })
  isTracked: boolean;

  @ApiProperty({
    description: 'Whether the product is taxable',
    example: true,
  })
  @Column({ name: 'is_taxable', default: true })
  isTaxable: boolean;

  @ApiProperty({
    description: 'Tax rate percentage',
    example: 7.5,
    required: false,
  })
  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate: number | null;

  @ApiProperty({
    description: 'Manufacturer/Supplier name',
    example: 'ABC Manufacturing',
    required: false,
  })
  @Column({ length: 255, nullable: true })
  manufacturer: string | null;

  @ApiProperty({
    description: 'Manufacturer part number',
    example: 'MPN-12345',
    required: false,
  })
  @Column({ name: 'manufacturer_part_number', length: 100, nullable: true })
  manufacturerPartNumber: string | null;

  @ApiProperty({
    description: 'Lead time in days',
    example: 7,
    required: false,
  })
  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number | null;

  @ApiProperty({
    description: 'Product notes',
    example: 'Handle with care',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-01T10:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-07T10:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete timestamp',
    required: false,
  })
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // Computed property
  @ApiProperty({
    description: 'Profit margin percentage',
    example: 38.71,
  })
  get profitMargin(): number {
    if (!this.sellingPrice || this.standardCost === 0) return 0;
    return ((this.sellingPrice - this.standardCost) / this.sellingPrice) * 100;
  }

  // Computed property
  @ApiProperty({
    description: 'Markup percentage',
    example: 61.29,
  })
  get markup(): number {
    if (!this.sellingPrice || this.standardCost === 0) return 0;
    return ((this.sellingPrice - this.standardCost) / this.standardCost) * 100;
  }
}