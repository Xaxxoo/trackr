export interface BomStatistics {
  totalBoms: number;
  activeBoms: number;
  draftBoms: number;
  obsoleteBoms: number;
  bomsByType: {
    type: string;
    count: number;
  }[];
  bomsByProduct: {
    productId: string;
    productName: string;
    bomCount: number;
  }[];
  averageItemsPerBom: number;
  averageCostPerBom: number;
}