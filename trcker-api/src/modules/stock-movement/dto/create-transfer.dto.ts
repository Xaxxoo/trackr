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

export class CreateTransferDto {
  @ApiProperty({
    description: 'From warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  fromWarehouseId: string;

  @ApiProperty({
    description: 'To warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  toWarehouseId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

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

  @ApiProperty({
    description: 'Expected delivery date (ISO 8601)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  expectedDeliveryDate: string;

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
    description: 'Carrier name',
    example: 'FedEx',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  carrierName?: string;

  @ApiPropertyOptional({
    description: 'Tracking number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}