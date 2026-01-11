// src/app/(dashboard)/production/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getProductionOrder } from '@/lib/api/production';
import ProductionTimeline from '@/components/production/ProductionTimeline';
import MaterialConsumption from '@/components/production/MaterialConsumption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/formatters';

// Server Component with dynamic params
export default async function ProductionOrderPage({
  params,
}: {
  params: { id: string };
}) {
  // Server-side data fetching
  const order = await getProductionOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-gray-500">
            Product: {order.product.name} ({order.product.sku})
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Planned Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {order.plannedQuantity} {order.unitOfMeasure}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produced Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {order.producedQuantity} {order.unitOfMeasure}
            </p>
            <p className="text-sm text-gray-500">
              {order.completionPercentage}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {order.qualityYield.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500">
              {order.acceptedQuantity} accepted / {order.rejectedQuantity} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Component for interactive timeline */}
      <ProductionTimeline order={order} />

      {/* Server Component displaying consumption data */}
      <MaterialConsumption consumptions={order.materialConsumptions} />
    </div>
  );
}