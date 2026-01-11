import * as z from 'zod';
import { ProductCategory, ProductStatus } from '@/types/product.types';

export const productSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  
  description: z.string().optional(),
  
  category: z.nativeEnum(ProductCategory, {
    required_error: 'Category is required',
  }),
  
  unitOfMeasure: z
    .string()
    .min(1, 'Unit of measure is required')
    .max(20, 'Unit of measure must be less than 20 characters'),
  
  basePrice: z
    .number()
    .min(0, 'Base price must be non-negative')
    .or(z.string().transform((val) => parseFloat(val))),
  
  costPrice: z
    .number()
    .min(0, 'Cost price must be non-negative')
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  sellingPrice: z
    .number()
    .min(0, 'Selling price must be non-negative')
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  weight: z
    .number()
    .min(0, 'Weight must be non-negative')
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  weightUnit: z.string().max(10).optional(),
  
  dimensions: z
    .object({
      length: z.number().min(0).or(z.string().transform((val) => parseFloat(val))),
      width: z.number().min(0).or(z.string().transform((val) => parseFloat(val))),
      height: z.number().min(0).or(z.string().transform((val) => parseFloat(val))),
      unit: z.string().max(10),
    })
    .optional(),
  
  barcode: z.string().max(100).optional(),
  hsCode: z.string().max(20).optional(),
  
  minStockLevel: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  maxStockLevel: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  reorderPoint: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  
  leadTime: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val) : undefined))),
  
  shelfLife: z
    .number()
    .min(0)
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val) : undefined))),
  
  isSerialized: z.boolean().optional(),
  isBatchTracked: z.boolean().optional(),
  
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = productSchema
  .partial()
  .extend({
    status: z.nativeEnum(ProductStatus).optional(),
    isActive: z.boolean().optional(),
  });

export type ProductFormValues = z.infer<typeof productSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;