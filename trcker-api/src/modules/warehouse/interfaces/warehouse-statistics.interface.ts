export interface WarehouseStatistics {
  totalWarehouses: number;
  activeWarehouses: number;
  totalLocations: number;
  occupiedLocations: number;
  warehousesByType: {
    type: string;
    count: number;
  }[];
  totalCapacity: number;
  usedCapacity: number;
  capacityUtilization: number;
  totalStockValue: number;
  lowStockItems: number;
}