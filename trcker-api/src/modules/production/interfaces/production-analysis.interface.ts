export interface MaterialVarianceReport {
  materialId: string;
  materialCode: string;
  materialName: string;
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  variancePercentage: number;
  totalCost: number;
  unitOfMeasure: string;
}

export interface ProductionEfficiencyReport {
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  plannedQuantity: number;
  producedQuantity: number;
  acceptedQuantity: number;
  efficiency: number;
  qualityYield: number;
  plannedDuration: number;
  actualDuration: number;
  timeEfficiency: number;
}