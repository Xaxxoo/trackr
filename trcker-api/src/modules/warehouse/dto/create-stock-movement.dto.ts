import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MovementType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Movement type',
    enum: MovementType,
    example: MovementType.RECEIPT,
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  movementType: MovementType;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiPropertyOptional({
    description: 'From warehouse ID (for transfers)',
  })
  @IsOptional()
  @IsUUID('4')
  fromWarehouseId?: string;

  @ApiPropertyOptional({
    description: 'To warehouse ID (for transfers)',
  })
  @IsOptional()
  @IsUUID('4')
  toWarehouseId?: string;

  @ApiPropertyOptional({
    description: 'From location ID',
  })
  @IsOptional()
  @IsUUID('4')
  fromLocationId?: string;

  @ApiPropertyOptional({
    description: 'To location ID',
  })
  @IsOptional()
  @IsUUID('4')
  toLocationId?: string;

  @ApiPropertyOptional({
    description: 'Reference type',
    example: 'PurchaseOrder',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'Reference ID',
  })
  @IsOptional()
  @IsUUID('4')
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Movement date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({
    description: 'Unit cost',
    example: 45.50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}