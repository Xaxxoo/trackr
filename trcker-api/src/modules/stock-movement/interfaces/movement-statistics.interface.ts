export interface MovementStatistics {
  totalMovements: number;
  movementsByType: {
    type: string;
    count: number;
    totalQuantity: number;
  }[];
  movementsByStatus: {
    status: string;
    count: number;
  }[];
  receiptsCount: number;
  issuesCount: number;
  transfersCount: number;
  adjustmentsCount: number;
  totalReceiptQuantity: number;
  totalIssueQuantity: number;
  netStockChange: number;
  activeReservations: number;
  totalReservedQuantity: number;
}