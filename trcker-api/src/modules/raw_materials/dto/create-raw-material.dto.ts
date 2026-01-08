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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RawMaterialType, QualityGrade } from '../entities/raw-material.entity';

export class CreateRawMaterialDto {
  @ApiProperty({
    description: 'Material code',
    example: 'RM-COT-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Material name',
    example: 'Premium Cotton Fiber',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Material type',
    enum: RawMaterialType,
    example: RawMaterialType.COTTON,
  })
  @IsEnum(RawMaterialType)
  @IsNotEmpty()
  type: RawMaterialType;

  @ApiPropertyOptional({
    description: 'Quality grade',
    enum: QualityGrade,
    example: QualityGrade.PREMIUM,
  })
  @IsOptional()
  @IsEnum(QualityGrade)
  qualityGrade?: QualityGrade;

  @ApiPropertyOptional({
    description: 'Description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiPropertyOptional({
    description: 'Primary supplier ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4')
  supplierId?: string;

  @ApiProperty({
    description: 'Standard cost per unit',
    example: 45.50,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  standardCost: number;

  @ApiPropertyOptional({
    description: 'Current market price',
    example: 48.00,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentMarketPrice?: number;

  @ApiProperty({
    description: 'Reorder level',
    example: 500,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  reorderLevel: number;

  @ApiProperty({
    description: 'Reorder quantity',
    example: 1000,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  reorderQuantity: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Lead time in days',
    example: 14,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({
    description: 'Shelf life in days',
    example: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shelfLifeDays?: number;

  @ApiPropertyOptional({
    description: 'Storage conditions',
  })
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional({
    description: 'Safety requirements',
  })
  @IsOptional()
  @IsString()
  safetyRequirements?: string;

  @ApiPropertyOptional({
    description: 'Specifications',
  })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiPropertyOptional({
    description: 'Is hazardous',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isHazardous?: boolean;

  @ApiPropertyOptional({
    description: 'Requires quality check',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  requiresQualityCheck?: boolean;
}