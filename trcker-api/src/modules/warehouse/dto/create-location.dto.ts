import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LocationType } from '../entities/warehouse-location.entity';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Location code',
    example: 'A-01-01',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Aisle A, Row 1, Shelf 1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Location type',
    enum: LocationType,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({
    description: 'Aisle',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  aisle?: string;

  @ApiPropertyOptional({
    description: 'Row',
    example: '01',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  row?: string;

  @ApiPropertyOptional({
    description: 'Level',
    example: '01',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  level?: string;

  @ApiPropertyOptional({
    description: 'Position',
    example: '01',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  position?: string;

  @ApiPropertyOptional({
    description: 'Maximum capacity',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxCapacity?: number;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}