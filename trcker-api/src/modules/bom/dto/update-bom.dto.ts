import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBomDto } from './create-bom.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BomStatus } from '../entities/bom.entity';

export class UpdateBomDto extends PartialType(
  OmitType(CreateBomDto, ['bomNumber', 'productId'] as const),
) {
  @ApiPropertyOptional({
    description: 'BOM status',
    enum: BomStatus,
  })
  @IsOptional()
  @IsEnum(BomStatus)
  status?: BomStatus;

  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}