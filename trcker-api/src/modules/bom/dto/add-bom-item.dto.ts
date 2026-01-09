import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ItemType, ItemConsumptionType } from '../entities/bom-item.entity';

export class AddBomItemDto {
  @ApiProperty({
    description: 'Item type',
    enum: ItemType,
    example: ItemType.RAW_MATERIAL,
  })
  @IsEnum(ItemType)
  @IsNotEmpty()
  itemType: ItemType;

  @ApiProperty({
    description: 'Item ID (raw material or product)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  itemId: string;

  @ApiPropertyOptional({
    description: 'Sequence number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sequenceNumber?: number;

  @ApiProperty({
    description: 'Quantity required',
    example: 50,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiPropertyOptional({
    description: 'Scrap percentage',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  scrapPercentage?: number;

  @ApiProperty({
    description: 'Unit cost',
    example: 45.50,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  unitCost: number;

  @ApiPropertyOptional({
    description: 'Consumption type',
    enum: ItemConsumptionType,
  })
  @IsOptional()
  @IsEnum(ItemConsumptionType)
  consumptionType?: ItemConsumptionType;

  @ApiPropertyOptional({
    description: 'Is optional',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({
    description: 'Is critical',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({
    description: 'Reference designator',
    example: 'R1, R2',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceDesignator?: string;

  @ApiPropertyOptional({
    description: 'Assembly instructions',
  })
  @IsOptional()
  @IsString()
  assemblyInstructions?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}