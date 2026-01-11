// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';
import { 
  getInventoryStatistics,
  getProductionStatistics,
  getWarehouseStatistics,
  getRecentActivity 
} from '@/lib/api/dashboard';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import InventoryChart from '@/components/dashboard/Charts/InventoryChart';
import ProductionChart from '@/components/dashboard/Charts/ProductionChart';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
  // Parallel data fetching
  const [inventoryStats, productionStats, warehouseStats, recentActivity] =
    await Promise.all([
      getInventoryStatistics(),
      getProductionStatistics(),
      getWarehouseStatistics(),
      getRecentActivity(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inventory Value"
          value={inventoryStats.totalValue}
          change={inventoryStats.valueChange}
          icon="DollarSign"
        />
        <StatsCard
          title="Low Stock Items"
          value={inventoryStats.lowStockItems}
          change={inventoryStats.lowStockChange}
          icon="AlertTriangle"
          variant="warning"
        />
        <StatsCard
          title="Active Production"
          value={productionStats.activeOrders}
          change={productionStats.ordersChange}
          icon="Factory"
        />
        <StatsCard
          title="Warehouses"
          value={warehouseStats.totalWarehouses}
          change={warehouseStats.capacityUtilization}
          icon="Warehouse"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <InventoryChart data={inventoryStats.chartData} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <ProductionChart data={productionStats.chartData} />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivity} />
    </div>
  );
}