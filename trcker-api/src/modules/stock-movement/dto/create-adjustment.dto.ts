import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AdjustmentType, AdjustmentReason } from '../entities/stock-adjustment.entity';

export class CreateAdjustmentDto {
  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Adjustment type',
    enum: AdjustmentType,
    example: AdjustmentType.INCREASE,
  })
  @IsEnum(AdjustmentType)
  @IsNotEmpty()
  adjustmentType: AdjustmentType;

  @ApiProperty({
    description: 'Adjustment reason',
    enum: AdjustmentReason,
    example: AdjustmentReason.PHYSICAL_COUNT,
  })
  @IsEnum(AdjustmentReason)
  @IsNotEmpty()
  adjustmentReason: AdjustmentReason;

  @ApiProperty({
    description: 'Adjustment quantity',
    example: 5,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  adjustmentQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Reason details',
    example: 'Physical count showed 5 more units than system',
  })
  @IsString()
  @IsNotEmpty()
  reasonDetails: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}