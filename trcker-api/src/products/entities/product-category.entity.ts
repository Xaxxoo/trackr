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

export enum CategoryType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  FINISHED_GOOD = 'FINISHED_GOOD',
  SEMI_FINISHED = 'SEMI_FINISHED',
  PACKAGING = 'PACKAGING',
  CONSUMABLE = 'CONSUMABLE',
}

@Entity('product_categories')
@Index(['name'], { unique: true })
@Index(['type'])
export class ProductCategory {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Cotton Products',
  })
  @Column({ unique: true, length: 100 })
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryType,
    example: CategoryType.RAW_MATERIAL,
  })
  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @ApiProperty({
    description: 'Category description',
    example: 'Raw materials for cotton-based products',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Category code',
    example: 'COT',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  code: string | null;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Product', 'category')
  products: any[];
}