import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ProductionOrderStatus,
  ProductionOrderPriority,
} from '../entities/production-order.entity';

export class ProductionOrderQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by order number',
    example: 'PO-2024',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsUUID('4')
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ProductionOrderStatus,
  })
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: ProductionOrderPriority,
  })
  @IsOptional()
  @IsEnum(ProductionOrderPriority)
  priority?: ProductionOrderPriority;

  @ApiPropertyOptional({
    description: 'Filter by work center',
  })
  @IsOptional()
  @IsString()
  workCenter?: string;

  @ApiPropertyOptional({
    description: 'Start date from',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Start date to',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'plannedStartDate',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'plannedStartDate';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}