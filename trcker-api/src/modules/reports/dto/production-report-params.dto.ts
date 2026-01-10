import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductionReportType {
  PRODUCTION_SUMMARY = 'PRODUCTION_SUMMARY',
  PRODUCTION_EFFICIENCY = 'PRODUCTION_EFFICIENCY',
  MATERIAL_CONSUMPTION = 'MATERIAL_CONSUMPTION',
  QUALITY_METRICS = 'QUALITY_METRICS',
}

export class ProductionReportParamsDto {
  @ApiPropertyOptional({
    description: 'Report type',
    enum: ProductionReportType,
  })
  @IsOptional()
  @IsEnum(ProductionReportType)
  reportType?: ProductionReportType;

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
}