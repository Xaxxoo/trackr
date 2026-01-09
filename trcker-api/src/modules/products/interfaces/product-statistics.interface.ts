export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  trackedProducts: number;
  productsByCategory: {
    categoryId: string;
    categoryName: string;
    categoryType: string;
    count: number;
  }[];
  productsByUnitOfMeasure: {
    unitOfMeasure: string;
    count: number;
  }[];
  averageStandardCost: number;
  averageSellingPrice: number;
  averageProfitMargin: number;
  lowStockProducts: number;
}