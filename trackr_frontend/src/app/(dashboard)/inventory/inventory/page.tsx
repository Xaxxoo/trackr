// src/app/(dashboard)/inventory/page.tsx
import { Suspense } from 'react';
import { getInventory } from '@/lib/api/inventory';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import { Skeleton } from '@/components/ui/skeleton';

// Server Component (default)
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; warehouse?: string };
}) {
  // Server-side data fetching
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const warehouse = searchParams.warehouse || '';

  // Fetch data on server
  const inventoryData = await getInventory({
    page,
    limit: 20,
    search,
    warehouseId: warehouse,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Link href="/inventory/new">
          <Button>Add New Item</Button>
        </Link>
      </div>

      {/* Client Component for interactive filters */}
      <InventoryFilters />

      {/* Client Component for sortable, interactive table */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <InventoryTable 
          data={inventoryData.items}
          total={inventoryData.total}
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}