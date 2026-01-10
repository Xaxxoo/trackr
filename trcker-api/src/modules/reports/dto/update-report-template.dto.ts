import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReportTemplateDto } from './create-report-template.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportTemplateDto extends PartialType(
  OmitType(CreateReportTemplateDto, ['code'] as const),
) {
  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}