import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportCategory, ReportFormat } from '../entities/report-template.entity';

export class CreateReportTemplateDto {
  @ApiProperty({
    description: 'Template code',
    example: 'INV-STOCK-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Template name',
    example: 'Stock Levels Report',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category',
    enum: ReportCategory,
    example: ReportCategory.INVENTORY,
  })
  @IsEnum(ReportCategory)
  @IsNotEmpty()
  category: ReportCategory;

  @ApiProperty({
    description: 'Report type',
    example: 'STOCK_LEVELS',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reportType: string;

  @ApiPropertyOptional({
    description: 'Default format',
    enum: ReportFormat,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  defaultFormat?: ReportFormat;

  @ApiPropertyOptional({
    description: 'Query template',
  })
  @IsOptional()
  @IsString()
  queryTemplate?: string;

  @ApiPropertyOptional({
    description: 'Parameters schema',
  })
  @IsOptional()
  @IsObject()
  parametersSchema?: any;

  @ApiPropertyOptional({
    description: 'Layout configuration',
  })
  @IsOptional()
  @IsObject()
  layoutConfig?: any;
}