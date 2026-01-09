export interface BomCostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
}

export interface BomCostByCategory {
  categoryName: string;
  totalCost: number;
  percentage: number;
  items: {
    itemCode: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
}

export interface BomCostAnalysis {
  bomId: string;
  bomNumber: string;
  productName: string;
  baseQuantity: number;
  breakdown: BomCostBreakdown;
  byCategory: BomCostByCategory[];
  criticalItems: {
    itemCode: string;
    itemName: string;
    totalCost: number;
    percentage: number;
  }[];
}