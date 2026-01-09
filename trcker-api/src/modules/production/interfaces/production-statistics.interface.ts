export interface ProductionStatistics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  ordersByPriority: {
    priority: string;
    count: number;
  }[];
  totalPlannedQuantity: number;
  totalProducedQuantity: number;
  totalAcceptedQuantity: number;
  averageQualityYield: number;
  averageCompletionRate: number;
}