import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartProductionDto {
  @ApiPropertyOptional({
    description: 'Work center',
    example: 'Line 1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workCenter?: string;

  @ApiPropertyOptional({
    description: 'Shift',
    example: 'Morning Shift',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shift?: string;

  @ApiPropertyOptional({
    description: 'Operator ID',
  })
  @IsOptional()
  @IsUUID('4')
  operatorId?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}