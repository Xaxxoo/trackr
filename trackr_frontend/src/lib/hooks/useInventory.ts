// src/lib/hooks/useInventory.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Inventory, CreateInventoryDto } from '@/types/inventory.types';
import { toast } from '@/components/ui/use-toast';

export function useInventoryList(params: any) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const client = apiClient.getClient();
      const { data } = await client.get('/api/v1/inventory', { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useInventoryDetail(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const client = apiClient.getClient();
      const { data } = await client.get(`/api/v1/inventory/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInventoryDto) => {
      const client = apiClient.getClient();
      const { data } = await client.post('/api/v1/inventory', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create inventory',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const client = apiClient.getClient();
      const { data } = await client.put(`/api/v1/inventory/${id}`, payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.id] });
      toast({
        title: 'Success',
        description: 'Inventory updated successfully',
      });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = apiClient.getClient();
      await client.delete(`/api/v1/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item deleted',
      });
    },
  });
}