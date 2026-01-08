import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum QualityCheckResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export class ReceiveBatchDto {
  @ApiProperty({
    description: 'Quantity received',
    example: 980,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantityReceived: number;

  @ApiPropertyOptional({
    description: 'Quality check status',
    enum: QualityCheckResult,
    example: QualityCheckResult.PASSED,
  })
  @IsOptional()
  @IsEnum(QualityCheckResult)
  qualityCheckStatus?: QualityCheckResult;

  @ApiPropertyOptional({
    description: 'Quality check notes',
  })
  @IsOptional()
  @IsString()
  qualityCheckNotes?: string;

  @ApiPropertyOptional({
    description: 'Receiving notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}