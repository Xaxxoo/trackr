import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductStatistics } from '@/types/product.types';
import { Package, PackageCheck, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface ProductStatsProps {
  statistics: ProductStatistics;
}

export default function ProductStats({ statistics }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {statistics.activeProducts} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.activeProducts}</div>
          <p className="text-xs text-muted-foreground">
            {((statistics.activeProducts / statistics.totalProducts) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statistics.totalInventoryValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total stock value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statistics.averagePrice)}
          </div>
          <p className="text-xs text-muted-foreground">
            Per product
          </p>
        </CardContent>
      </Card>
    </div>
  );
}