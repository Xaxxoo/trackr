import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseDto extends PartialType(
  OmitType(CreateWarehouseDto, ['code'] as const),
) {
  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}