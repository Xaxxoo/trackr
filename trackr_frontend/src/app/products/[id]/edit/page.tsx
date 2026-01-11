'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useProductDetail, useUpdateProduct } from '@/lib/hooks/useProducts';
import { productSchema, type ProductFormValues } from '@/lib/validations/product.schemas';
import ProductForm from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: product, isLoading } = useProductDetail(params.id);
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  // Populate form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category,
        unitOfMeasure: product.unitOfMeasure,
        basePrice: product.basePrice,
        costPrice: product.costPrice || undefined,
        sellingPrice: product.sellingPrice || undefined,
        weight: product.weight || undefined,
        weightUnit: product.weightUnit || undefined,
        dimensions: product.dimensions || undefined,
        barcode: product.barcode || undefined,
        hsCode: product.hsCode || undefined,
        minStockLevel: product.minStockLevel || undefined,
        maxStockLevel: product.maxStockLevel || undefined,
        reorderPoint: product.reorderPoint || undefined,
        leadTime: product.leadTime || undefined,
        shelfLife: product.shelfLife || undefined,
        isSerialized: product.isSerialized,
        isBatchTracked: product.isBatchTracked,
        tags: product.tags || [],
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProduct.mutateAsync({
        id: params.id,
        payload: values,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="text-muted-foreground mt-2">
            The product you're looking for doesn't exist.
          </p>
          <Link href="/products">
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/products/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product information for {product.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Update the product details. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Product"
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}