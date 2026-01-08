import { PartialType } from '@nestjs/swagger';
import { CreateRawMaterialDto } from './create-raw-material.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRawMaterialDto extends PartialType(CreateRawMaterialDto) {
  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}