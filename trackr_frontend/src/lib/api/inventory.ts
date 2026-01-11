// src/lib/api/inventory.ts (Server-side)
import { apiClient } from './client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { 
  Inventory, 
  InventoryQueryParams, 
  PaginatedInventoryResponse 
} from '@/types/inventory.types';

export async function getInventory(
  params: InventoryQueryParams
): Promise<PaginatedInventoryResponse> {
  const session = await getServerSession(authOptions);
  const client = await apiClient.getServerClient(session?.accessToken);

  const { data } = await client.get('/api/v1/inventory', { params });
  return data.data;
}

export async function getInventoryById(id: string): Promise<Inventory> {
  const session = await getServerSession(authOptions);
  const client = await apiClient.getServerClient(session?.accessToken);

  const { data } = await client.get(`/api/v1/inventory/${id}`);
  return data.data;
}

// Server Action for mutations
export async function createInventoryItem(formData: FormData) {
  'use server';
  
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const client = await apiClient.getServerClient(session.accessToken);
  
  const payload = {
    productId: formData.get('productId'),
    warehouseId: formData.get('warehouseId'),
    quantity: Number(formData.get('quantity')),
    // ... other fields
  };

  const { data } = await client.post('/api/v1/inventory', payload);
  revalidatePath('/inventory');
  return data.data;
}