import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionBatch } from '../entities/production-batch.entity';
import { MaterialConsumption } from '../entities/material-consumption.entity';

export interface PaginatedProductionOrdersResponse {
  items: ProductionOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductionOrderDetailResponse extends ProductionOrder {
  batches: ProductionBatch[];
  materialConsumptions: MaterialConsumption[];
}