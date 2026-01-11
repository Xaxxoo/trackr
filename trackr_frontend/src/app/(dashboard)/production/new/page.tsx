// src/app/(dashboard)/production/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateProductionOrder } from '@/lib/hooks/useProduction';
import { useProductsList } from '@/lib/hooks/useProducts';
import { useBOMList } from '@/lib/hooks/useBOM';
import { useWarehousesList } from '@/lib/hooks/useWarehouses';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const productionOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  productId: z.string().uuid('Select a product'),
  bomId: z.string().uuid('Select a BOM').optional(),
  warehouseId: z.string().uuid('Select a warehouse'),
  plannedQuantity: z.number().min(1, 'Quantity must be at least 1'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  plannedStartDate: z.string().min(1, 'Start date is required'),
  plannedEndDate: z.string().min(1, 'End date is required'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  workCenter: z.string().optional(),
  shift: z.string().optional(),
  notes: z.string().optional(),
});

type ProductionOrderFormValues = z.infer<typeof productionOrderSchema>;

export default function NewProductionOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: products } = useProductsList();
  const { data: boms } = useBOMList();
  const { data: warehouses } = useWarehousesList();
  const createOrder = useCreateProductionOrder();

  const form = useForm<ProductionOrderFormValues>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      unitOfMeasure: 'PIECES',
    },
  });

  const selectedProduct = form.watch('productId');

  const onSubmit = async (values: ProductionOrderFormValues) => {
    setIsLoading(true);

    try {
      await createOrder.mutateAsync({
        ...values,
        plannedQuantity: Number(values.plannedQuantity),
      });

      toast({
        title: 'Success',
        description: 'Production order created successfully',
      });

      router.push('/production');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create production order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Production Order</h1>
        <p className="text-gray-500">Create a new production order</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="PO-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.items.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOM (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select BOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {boms?.items
                            .filter((bom) => bom.productId === selectedProduct)
                            .map((bom) => (
                              <SelectItem key={bom.id} value={bom.id}>
                                {bom.bomNumber} - v{bom.version}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses?.items.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plannedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitOfMeasure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <FormControl>
                        <Input placeholder="PIECES" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plannedStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plannedEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}