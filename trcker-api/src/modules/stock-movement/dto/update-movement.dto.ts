import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovementStatus } from '../entities/stock-movement.entity';

export class UpdateMovementDto {
  @ApiPropertyOptional({
    description: 'Status',
    enum: MovementStatus,
  })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({
    description: 'Actual date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  actualDate?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}