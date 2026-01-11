'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from '@/types/product.types';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function useProductsList(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const client = apiClient.getClient();
      const { data } = await client.get('/api/v1/products', { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const client = apiClient.getClient();
      const { data } = await client.get(`/api/v1/products/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: CreateProductDto) => {
      const client = apiClient.getClient();
      const { data } = await client.post('/api/v1/products', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      router.push(`/products/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create product',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductDto;
    }) => {
      const client = apiClient.getClient();
      const { data } = await client.put(`/api/v1/products/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      router.push(`/products/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = apiClient.getClient();
      await client.delete(`/api/v1/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      router.push('/products');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });
}

export function useProductStatistics() {
  return useQuery({
    queryKey: ['products', 'statistics'],
    queryFn: async () => {
      const client = apiClient.getClient();
      const { data } = await client.get('/api/v1/products/statistics');
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}