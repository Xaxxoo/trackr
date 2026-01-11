import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Archive,
  DollarSign,
  Package,
  Barcode,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import CategoryBadge from '@/components/products/CategoryBadge';
import ProductDeleteButton from '@/components/products/ProductDeleteButton';
import ProductStatusToggle from '@/components/products/ProductStatusToggle';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  
  return {
    title: `${product.name} | Products`,
    description: product.description || `Product details for ${product.name}`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <CategoryBadge category={product.category} />
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <ProductStatusToggle product={product} />
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <ProductDeleteButton productId={product.id} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(product.basePrice)}
            </div>
            <p className="text-xs text-muted-foreground">per {product.unitOfMeasure}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.costPrice ? formatCurrency(product.costPrice) : 'N/A'}
            </div>
            {product.costPrice && product.sellingPrice && (
              <p className="text-xs text-muted-foreground">
                Margin:{' '}
                {(
                  ((product.sellingPrice - product.costPrice) / product.sellingPrice) *
                  100
                ).toFixed(1)}
                %
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.sellingPrice ? formatCurrency(product.sellingPrice) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Retail price</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.leadTime ? `${product.leadTime} days` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Procurement time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Unit of Measure</dt>
                      <dd className="font-medium">{product.unitOfMeasure}</dd>
                    </div>
                    {product.barcode && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Barcode</dt>
                        <dd className="font-medium font-mono">{product.barcode}</dd>
                      </div>
                    )}
                    {product.hsCode && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">HS Code</dt>
                        <dd className="font-medium">{product.hsCode}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tracking Settings</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Serialized</dt>
                      <dd>
                        <Badge variant={product.isSerialized ? 'default' : 'secondary'}>
                          {product.isSerialized ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Batch Tracked</dt>
                      <dd>
                        <Badge variant={product.isBatchTracked ? 'default' : 'secondary'}>
                          {product.isBatchTracked ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                    {product.shelfLife && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Shelf Life</dt>
                        <dd className="font-medium">{product.shelfLife} days</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Physical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.weight && (
                <div>
                  <h3 className="font-semibold mb-2">Weight</h3>
                  <p className="text-muted-foreground">
                    {product.weight} {product.weightUnit || 'kg'}
                  </p>
                </div>
              )}

              {product.dimensions && (
                <div>
                  <h3 className="font-semibold mb-2">Dimensions</h3>
                  <p className="text-muted-foreground">
                    {product.dimensions.length} × {product.dimensions.width} ×{' '}
                    {product.dimensions.height} {product.dimensions.unit}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {product.minStockLevel !== null && (
                  <div>
                    <dt className="font-semibold mb-1">Minimum Stock Level</dt>
                    <dd className="text-muted-foreground">
                      {product.minStockLevel} {product.unitOfMeasure}
                    </dd>
                  </div>
                )}
                {product.maxStockLevel !== null && (
                  <div>
                    <dt className="font-semibold mb-1">Maximum Stock Level</dt>
                    <dd className="text-muted-foreground">
                      {product.maxStockLevel} {product.unitOfMeasure}
                    </dd>
                  </div>
                )}
                {product.reorderPoint !== null && (
                  <div>
                    <dt className="font-semibold mb-1">Reorder Point</dt>
                    <dd className="text-muted-foreground">
                      {product.reorderPoint} {product.unitOfMeasure}
                    </dd>
                  </div>
                )}
                {product.leadTime !== null && (
                  <div>
                    <dt className="font-semibold mb-1">Lead Time</dt>
                    <dd className="text-muted-foreground">{product.leadTime} days</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold mb-1">Base Price</dt>
                  <dd className="text-2xl font-bold">
                    {formatCurrency(product.basePrice)}
                  </dd>
                  <dd className="text-sm text-muted-foreground">
                    per {product.unitOfMeasure}
                  </dd>
                </div>

                {product.costPrice && (
                  <div>
                    <dt className="font-semibold mb-1">Cost Price</dt>
                    <dd className="text-2xl font-bold">
                      {formatCurrency(product.costPrice)}
                    </dd>
                  </div>
                )}

                {product.sellingPrice && (
                  <div>
                    <dt className="font-semibold mb-1">Selling Price</dt>
                    <dd className="text-2xl font-bold">
                      {formatCurrency(product.sellingPrice)}
                    </dd>
                    {product.costPrice && (
                      <dd className="text-sm text-muted-foreground mt-1">
                        Gross margin:{' '}
                        {formatCurrency(product.sellingPrice - product.costPrice)} (
                        {(
                          ((product.sellingPrice - product.costPrice) /
                            product.sellingPrice) *
                          100
                        ).toFixed(1)}
                        %)
                      </dd>
                    )}
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-semibold mb-1">Created</dt>
              <dd className="text-muted-foreground">
                {formatDate(product.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold mb-1">Last Updated</dt>
              <dd className="text-muted-foreground">
                {formatDate(product.updatedAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}