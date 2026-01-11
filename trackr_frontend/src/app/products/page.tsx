import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts, getProductStatistics } from '@/lib/api/products';
import ProductList from '@/components/products/ProductList';
import ProductStats from '@/components/products/ProductStats';
import ProductFilters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Products | Manufacturing Inventory',
  description: 'Manage your product catalog',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 20;

  // Parallel data fetching
  const [productsData, statistics] = await Promise.all([
    getProducts({
      page,
      limit,
      search: searchParams.search,
      category: searchParams.category as any,
      status: searchParams.status as any,
      sortBy: searchParams.sortBy || 'createdAt',
      sortOrder: (searchParams.sortOrder as any) || 'DESC',
    }),
    getProductStatistics(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Link href="/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <ProductStats statistics={statistics} />
      </Suspense>

      {/* Filters */}
      <ProductFilters />

      {/* Product List */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        }
      >
        <ProductList
          products={productsData.items}
          total={productsData.total}
          page={page}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}