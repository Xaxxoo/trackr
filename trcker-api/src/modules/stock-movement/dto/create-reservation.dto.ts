import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
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
    description: 'Reserved quantity',
    example: 50,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  reservedQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Reference type',
    example: 'SalesOrder',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  referenceType: string;

  @ApiProperty({
    description: 'Reference ID',
  })
  @IsUUID('4')
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({
    description: 'Reference number',
    example: 'SO-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  referenceNumber: string;

  @ApiProperty({
    description: 'Expiry date (ISO 8601)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}