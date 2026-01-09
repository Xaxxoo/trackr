export interface MovementSummary {
  productId: string;
  productCode: string;
  productName: string;
  receipts: number;
  issues: number;
  transfers: number;
  adjustments: number;
  netChange: number;
  currentStock: number;
}

export interface WarehouseMovementSummary {
  warehouseId: string;
  warehouseName: string;
  totalMovements: number;
  receipts: number;
  issues: number;
  transfers: number;
  adjustments: number;
  netChange: number;
}