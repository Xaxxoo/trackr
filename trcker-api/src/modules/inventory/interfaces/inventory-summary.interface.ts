export interface InventorySummary {
  totalValue: number;
  transactionCount: number;
  byType: {
    type: string;
    count: number;
    totalQuantity: number;
    totalValue: number;
  }[];
  byWarehouse: {
    warehouseId: string;
    warehouseName: string;
    transactionCount: number;
    totalValue: number;
  }[];
  recentTransactions: {
    date: string;
    count: number;
    value: number;
  }[];
}