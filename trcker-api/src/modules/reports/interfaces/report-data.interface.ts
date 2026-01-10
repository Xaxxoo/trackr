export interface ReportData {
  title: string;
  generatedAt: Date;
  parameters: any;
  data: any[];
  summary?: any;
  charts?: any[];
  metadata?: {
    rowCount: number;
    executionTime: number;
    [key: string]: any;
  };
}

export interface InventoryReportData extends ReportData {
  data: {
    productCode: string;
    productName: string;
    warehouse: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    unitCost: number;
    totalValue: number;
    reorderPoint?: number;
    status?: string;
  }[];
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
  };
}

export interface ProductionReportData extends ReportData {
  data: {
    orderNumber: string;
    product: string;
    plannedQuantity: number;
    producedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    efficiency: number;
    qualityYield: number;
  }[];
  summary: {
    totalOrders: number;
    averageEfficiency: number;
    averageQualityYield: number;
  };
}