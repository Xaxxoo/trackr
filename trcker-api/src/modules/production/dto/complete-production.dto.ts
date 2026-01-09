import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CompleteProductionDto {
  @ApiProperty({
    description: 'Produced quantity',
    example: 950,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  producedQuantity: number;

  @ApiProperty({
    description: 'Accepted quantity',
    example: 940,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  acceptedQuantity: number;

  @ApiProperty({
    description: 'Rejected quantity',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rejectedQuantity: number;

  @ApiPropertyOptional({
    description: 'Quality notes',
  })
  @IsOptional()
  @IsString()
  qualityNotes?: string;

  @ApiPropertyOptional({
    description: 'Completion notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}