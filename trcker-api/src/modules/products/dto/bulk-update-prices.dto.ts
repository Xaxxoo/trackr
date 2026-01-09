import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductPriceUpdateDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  productId: string;

  @ApiProperty({
    description: 'New standard cost',
    example: 15.50,
    required: false,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  standardCost?: number;

  @ApiProperty({
    description: 'New selling price',
    example: 25.00,
    required: false,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPrice?: number;
}

export class BulkUpdatePricesDto {
  @ApiProperty({
    description: 'Array of product price updates',
    type: [ProductPriceUpdateDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceUpdateDto)
  @ArrayMinSize(1, { message: 'At least one product is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 products per batch' })
  products: ProductPriceUpdateDto[];
}

export class BulkUpdatePricesResponseDto {
  @ApiProperty({
    description: 'Number of products updated',
    example: 5,
  })
  updated: number;

  @ApiProperty({
    description: 'Number of products failed',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: 'Array of updated product IDs',
  })
  productIds: string[];

  @ApiProperty({
    description: 'Array of errors',
  })
  errors: Array<{ productId: string; error: string }>;
}