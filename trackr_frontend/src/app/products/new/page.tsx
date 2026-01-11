'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { productSchema, type ProductFormValues } from '@/lib/validations/product.schemas';
import ProductForm from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProduct = useCreateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      unitOfMeasure: 'PIECES',
      basePrice: 0,
      costPrice: 0,
      sellingPrice: 0,
      isSerialized: false,
      isBatchTracked: false,
      tags: [],
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await createProduct.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the details for the new product. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Create Product"
          />
        </CardContent>
      </Card>
    </div>
  );
}