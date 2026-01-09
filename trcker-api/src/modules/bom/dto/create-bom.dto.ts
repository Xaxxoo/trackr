import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BomType } from '../entities/bom.entity';

export class CreateBomDto {
  @ApiProperty({
    description: 'BOM number',
    example: 'BOM-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bomNumber: string;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'BOM name',
    example: 'Baby Diaper Medium - Standard BOM',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'BOM description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'BOM type',
    enum: BomType,
  })
  @IsOptional()
  @IsEnum(BomType)
  bomType?: BomType;

  @ApiProperty({
    description: 'Base quantity',
    example: 100,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  baseQuantity: number;

  @ApiProperty({
    description: 'Base unit of measure',
    example: 'PIECES',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  baseUnit: string;

  @ApiPropertyOptional({
    description: 'Labor cost',
    example: 25.00,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  laborCost?: number;

  @ApiPropertyOptional({
    description: 'Overhead cost',
    example: 15.00,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overheadCost?: number;

  @ApiProperty({
    description: 'Effective date (ISO 8601)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @ApiPropertyOptional({
    description: 'Expiry date (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Is default BOM for product',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}