import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MaterialType } from '../entities/material-consumption.entity';

export class RecordConsumptionDto {
  @ApiProperty({
    description: 'Material type',
    enum: MaterialType,
    example: MaterialType.RAW_MATERIAL,
  })
  @IsEnum(MaterialType)
  @IsNotEmpty()
  materialType: MaterialType;

  @ApiProperty({
    description: 'Material ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: 'Actual quantity consumed',
    example: 53.2,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @IsNotEmpty()
  actualQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID('4')
  @IsNotEmpty()
  warehouseId: string;

  @ApiPropertyOptional({
    description: 'Batch number',
    example: 'BATCH-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchNumber?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}