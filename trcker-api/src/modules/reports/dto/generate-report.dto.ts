import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat } from '../entities/report-template.entity';

export class GenerateReportDto {
  @ApiProperty({
    description: 'Template ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  templateId: string;

  @ApiPropertyOptional({
    description: 'Format',
    enum: ReportFormat,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({
    description: 'Parameters',
  })
  @IsOptional()
  @IsObject()
  parameters?: any;
}