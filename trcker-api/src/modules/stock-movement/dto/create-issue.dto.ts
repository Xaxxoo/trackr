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

export class CreateIssueDto {
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
    description: 'Quantity',
    example: 50,
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
    description: 'From location ID',
  })
  @IsOptional()
  @IsUUID('4')
  fromLocationId?: string;

  @ApiPropertyOptional({
    description: 'Reference type',
    example: 'SalesOrder',
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
    description: 'Reference number',
    example: 'SO-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Movement date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({
    description: 'Reason',
    example: 'Issued for production',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}