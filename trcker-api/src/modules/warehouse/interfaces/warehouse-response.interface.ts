import { Warehouse } from '../entities/warehouse.entity';
import { WarehouseLocation } from '../entities/warehouse-location.entity';

export interface PaginatedWarehousesResponse {
  items: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedLocationsResponse {
  items: WarehouseLocation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
