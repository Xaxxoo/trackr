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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductionOrderPriority } from '../entities/production-order.entity';

export class CreateProductionOrderDto {
  @ApiProperty({
    description: 'Production order number',
    example: 'PO-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  orderNumber: string;

  @ApiProperty({
    description: 'Product ID to produce',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description: 'BOM ID to use',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID('4')
  bomId?: string;

  @ApiProperty({
    description: 'Warehouse ID for finished goods',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID('4')
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    description: 'Planned quantity',
    example: 1000,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  plannedQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiPropertyOptional({
    description: 'Priority',
    enum: ProductionOrderPriority,
  })
  @IsOptional()
  @IsEnum(ProductionOrderPriority)
  priority?: ProductionOrderPriority;

  @ApiProperty({
    description: 'Planned start date (ISO 8601)',
    example: '2024-01-10',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedStartDate: string;

  @ApiProperty({
    description: 'Planned end date (ISO 8601)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedEndDate: string;

  @ApiPropertyOptional({
    description: 'Sales order reference',
    example: 'SO-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salesOrderNumber?: string;

  @ApiPropertyOptional({
    description: 'Work center/production line',
    example: 'Line 1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workCenter?: string;

  @ApiPropertyOptional({
    description: 'Shift',
    example: 'Morning Shift',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shift?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}