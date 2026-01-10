import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SalesReportType {
  SALES_SUMMARY = 'SALES_SUMMARY',
  SALES_BY_PRODUCT = 'SALES_BY_PRODUCT',
  SALES_BY_CUSTOMER = 'SALES_BY_CUSTOMER',
  SALES_TREND = 'SALES_TREND',
}

export class SalesReportParamsDto {
  @ApiPropertyOptional({
    description: 'Report type',
    enum: SalesReportType,
  })
  @IsOptional()
  @IsEnum(SalesReportType)
  reportType?: SalesReportType;

  @ApiPropertyOptional({
    description: 'Customer ID',
  })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

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