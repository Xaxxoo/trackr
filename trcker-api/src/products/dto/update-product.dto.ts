import {
  IsString,
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UnitOfMeasure } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Cotton Wool 100g',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Unit of measure',
    enum: UnitOfMeasure,
  })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @ApiPropertyOptional({
    description: 'Product variant',
    example: '100g',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  variant?: string;

  @ApiPropertyOptional({
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Reorder level',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Standard cost per unit',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  standardCost?: number;

  @ApiPropertyOptional({
    description: 'Selling price per unit',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether product is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether product is tracked',
  })
  @IsOptional()
  @IsBoolean()
  isTracked?: boolean;

  @ApiPropertyOptional({
    description: 'Whether product is taxable',
  })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({
    description: 'Tax rate percentage',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Manufacturer name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer part number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturerPartNumber?: string;

  @ApiPropertyOptional({
    description: 'Lead time in days',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({
    description: 'Product notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}