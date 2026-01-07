import {
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType, ReferenceType } from '../entities/inventory-transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Warehouse UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: TransactionType,
    example: TransactionType.IN,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Quantity (must be positive)',
    example: 100.50,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Unit cost (must be non-negative)',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit cost cannot be negative' })
  @IsNotEmpty()
  @Type(() => Number)
  unitCost: number;

  @ApiPropertyOptional({
    description: 'Reference type for the transaction',
    enum: ReferenceType,
    example: ReferenceType.PURCHASE,
  })
  @IsEnum(ReferenceType)
  @IsOptional()
  referenceType?: ReferenceType;

  @ApiPropertyOptional({
    description: 'Reference ID (required if referenceType is provided)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @ValidateIf((o) => o.referenceType !== undefined)
  @IsUUID('4')
  @IsOptional()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Monthly stock replenishment from Supplier ABC',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}