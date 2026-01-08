import { RawMaterial } from '../entities/raw-material.entity';
import { RawMaterialBatch } from '../entities/raw-material-batch.entity';

export interface PaginatedRawMaterialsResponse {
  items: RawMaterial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedBatchesResponse {
  items: RawMaterialBatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}