import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsEmail,
  IsNumber,
  Min,
  MaxLength,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WarehouseType } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse code',
    example: 'WH-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse - Lagos',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse type',
    enum: WarehouseType,
  })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({
    description: 'Description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Industrial Street',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '100001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Manager user ID',
  })
  @IsOptional()
  @IsUUID('4')
  managerId?: string;

  @ApiPropertyOptional({
    description: 'Contact phone',
    example: '+234-123-456-7890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'warehouse@company.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Total capacity',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalCapacity?: number;

  @ApiPropertyOptional({
    description: 'Operating hours',
    example: 'Mon-Fri: 8AM-6PM',
  })
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 6.5244,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 3.3792,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Is default warehouse',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Is temperature controlled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTemperatureControlled?: boolean;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}