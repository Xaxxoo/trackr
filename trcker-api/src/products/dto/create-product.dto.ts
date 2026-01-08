import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsBoolean,
  IsUrl,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UnitOfMeasure } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Stock Keeping Unit (unique product code)',
    example: 'COT-100G-001',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @MaxLength(100)
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Cotton Wool 100g',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({
    description: 'Unit of measure',
    enum: UnitOfMeasure,
    example: UnitOfMeasure.PIECES,
  })
  @IsEnum(UnitOfMeasure, { message: 'Invalid unit of measure' })
  @IsNotEmpty({ message: 'Unit of measure is required' })
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({
    description: 'Product variant',
    example: '100g',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  variant?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality absorbent cotton wool',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Reorder level',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxStockLevel?: number;

  @ApiProperty({
    description: 'Standard cost per unit',
    example: 15.50,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Standard cost cannot be negative' })
  @IsNotEmpty({ message: 'Standard cost is required' })
  standardCost: number;

  @ApiPropertyOptional({
    description: 'Selling price per unit',
    example: 25.00,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 0.1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions',
    example: '10 x 5 x 3',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/product.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether product is tracked in inventory',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTracked?: boolean;

  @ApiPropertyOptional({
    description: 'Whether product is taxable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({
    description: 'Tax rate percentage',
    example: 7.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Manufacturer name',
    example: 'ABC Manufacturing',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer part number',
    example: 'MPN-12345',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturerPartNumber?: string;

  @ApiPropertyOptional({
    description: 'Lead time in days',
    example: 7,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({
    description: 'Product notes',
    example: 'Handle with care',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}