'use client';

import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/lib/validations/product.schemas';
import { ProductCategory } from '@/types/product.types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
  isEdit?: boolean;
}

export default function ProductForm({
  form,
  onSubmit,
  isSubmitting,
  submitLabel,
  isEdit = false,
}: ProductFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PRD-001"
                      {...field}
                      disabled={isEdit}
                      className="uppercase"
                    />
                  </FormControl>
                  <FormDescription>
                    Unique product identifier (uppercase, numbers, hyphens)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Baby Diaper Medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ProductCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, ' ')}
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
              name="unitOfMeasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit of Measure *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PIECES">Pieces</SelectItem>
                      <SelectItem value="KG">Kilograms (KG)</SelectItem>
                      <SelectItem value="G">Grams (G)</SelectItem>
                      <SelectItem value="L">Liters (L)</SelectItem>
                      <SelectItem value="ML">Milliliters (ML)</SelectItem>
                      <SelectItem value="M">Meters (M)</SelectItem>
                      <SelectItem value="M2">Square Meters (M²)</SelectItem>
                      <SelectItem value="M3">Cubic Meters (M³)</SelectItem>
                      <SelectItem value="BOXES">Boxes</SelectItem>
                      <SelectItem value="ROLLS">Rolls</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Standard product price</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Cost to produce/acquire</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Retail price</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Physical Properties */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Physical Properties</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        className="flex-1"
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="weightUnit"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="LB">LB</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Dimensions (L × W × H)</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="dimensions.length"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Length"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.width"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Width"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.height"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Height"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.unit"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CM">CM</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="IN">IN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hsCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HS Code</FormLabel>
                  <FormControl>
                    <Input placeholder="4818.40" {...field} />
                  </FormControl>
                  <FormDescription>Harmonized System code</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Inventory Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Inventory Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="leadTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Time to procure/produce</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelfLife"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shelf Life (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Days before expiration</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isSerialized"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Serial Number Tracking</FormLabel>
                    <FormDescription>
                      Track individual items by serial number
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBatchTracked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Batch/Lot Tracking</FormLabel>
                    <FormDescription>
                      Track items by batch or lot number
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}