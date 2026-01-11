import { apiClient } from './client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  PaginatedProductsResponse,
  ProductStatistics,
} from '@/types/product.types';

// Server-side functions
export async function getProducts(
  params: ProductQueryParams = {}
): Promise<PaginatedProductsResponse> {
  const session = await getServerSession(authOptions);
  const client = await apiClient.getServerClient(session?.accessToken);

  const { data } = await client.get('/api/v1/products', { params });
  return data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const session = await getServerSession(authOptions);
  const client = await apiClient.getServerClient(session?.accessToken);

  const { data } = await client.get(`/api/v1/products/${id}`);
  return data.data;
}

export async function getProductStatistics(): Promise<ProductStatistics> {
  const session = await getServerSession(authOptions);
  const client = await apiClient.getServerClient(session?.accessToken);

  const { data } = await client.get('/api/v1/products/statistics');
  return data.data;
}

// Server Actions for mutations
export async function createProduct(formData: CreateProductDto) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const client = await apiClient.getServerClient(session.accessToken);
  const { data } = await client.post('/api/v1/products', formData);
  
  return data.data;
}

export async function updateProduct(id: string, formData: UpdateProductDto) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const client = await apiClient.getServerClient(session.accessToken);
  const { data } = await client.put(`/api/v1/products/${id}`, formData);
  
  return data.data;
}

export async function deleteProduct(id: string) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const client = await apiClient.getServerClient(session.accessToken);
  await client.delete(`/api/v1/products/${id}`);
}