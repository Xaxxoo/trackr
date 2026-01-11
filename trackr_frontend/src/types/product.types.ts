export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductCategory {
  RAW_MATERIAL = 'RAW_MATERIAL',
  FINISHED_GOOD = 'FINISHED_GOOD',
  SEMI_FINISHED = 'SEMI_FINISHED',
  PACKAGING = 'PACKAGING',
  CONSUMABLE = 'CONSUMABLE',
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  status: ProductStatus;
  unitOfMeasure: string;
  basePrice: number;
  costPrice: number | null;
  sellingPrice: number | null;
  weight: number | null;
  weightUnit: string | null;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  } | null;
  barcode: string | null;
  hsCode: string | null;
  minStockLevel: number | null;
  maxStockLevel: number | null;
  reorderPoint: number | null;
  leadTime: number | null;
  shelfLife: number | null;
  isActive: boolean;
  isSerialized: boolean;
  isBatchTracked: boolean;
  tags: string[];
  attributes: Record<string, any> | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  unitOfMeasure: string;
  basePrice: number;
  costPrice?: number;
  sellingPrice?: number;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  barcode?: string;
  hsCode?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  shelfLife?: number;
  isSerialized?: boolean;
  isBatchTracked?: boolean;
  tags?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  productsByCategory: Array<{
    category: string;
    count: number;
  }>;
  productsByStatus: Array<{
    status: string;
    count: number;
  }>;
  totalInventoryValue: number;
  averagePrice: number;
}