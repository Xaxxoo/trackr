import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductionOrderDto } from './create-production-order.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductionOrderStatus } from '../entities/production-order.entity';

export class UpdateProductionOrderDto extends PartialType(
  OmitType(CreateProductionOrderDto, ['orderNumber', 'productId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Status',
    enum: ProductionOrderStatus,
  })
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;
}