import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(
  OmitType(CreateLocationDto, ['code'] as const),
) {
  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}