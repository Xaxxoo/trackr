import { Product } from '../entities/product.entity';

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}