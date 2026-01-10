import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum InventoryReportType {
  STOCK_LEVELS = 'STOCK_LEVELS',
  STOCK_VALUATION = 'STOCK_VALUATION',
  STOCK_MOVEMENTS = 'STOCK_MOVEMENTS',
  LOW_STOCK = 'LOW_STOCK',
  AGING_ANALYSIS = 'AGING_ANALYSIS',
  ABC_ANALYSIS = 'ABC_ANALYSIS',
}

export class InventoryReportParamsDto {
  @ApiPropertyOptional({
    description: 'Report type',
    enum: InventoryReportType,
  })
  @IsOptional()
  @IsEnum(InventoryReportType)
  reportType?: InventoryReportType;

  @ApiPropertyOptional({
    description: 'Warehouse ID',
  })
  @IsOptional()
  @IsUUID('4')
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Product ID',
  })
  @IsOptional()
  @IsUUID('4')
  productId?: string;

  @ApiPropertyOptional({
    description: 'Date from (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Date to (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Include zero stock',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeZeroStock?: boolean;

  @ApiPropertyOptional({
    description: 'Low stock only',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  lowStockOnly?: boolean;
}