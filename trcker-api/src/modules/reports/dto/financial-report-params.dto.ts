import {
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum FinancialReportType {
  INVENTORY_VALUATION = 'INVENTORY_VALUATION',
  COST_ANALYSIS = 'COST_ANALYSIS',
  PROFITABILITY = 'PROFITABILITY',
}

export class FinancialReportParamsDto {
  @ApiPropertyOptional({
    description: 'Report type',
    enum: FinancialReportType,
  })
  @IsOptional()
  @IsEnum(FinancialReportType)
  reportType?: FinancialReportType;

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