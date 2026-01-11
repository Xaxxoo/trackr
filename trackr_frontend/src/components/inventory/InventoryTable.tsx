// src/components/inventory/InventoryTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Inventory } from '@/types/inventory.types';
import { formatCurrency } from '@/lib/utils/formatters';
import Pagination from '@/components/shared/Pagination';

interface InventoryTableProps {
  data: Inventory[];
  total: number;
  currentPage: number;
}

export default function InventoryTable({
  data,
  total,
  currentPage,
}: InventoryTableProps) {
  const router = useRouter();
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/inventory/${id}`);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('productCode')}>
              Product Code
            </TableHead>
            <TableHead onClick={() => handleSort('productName')}>
              Product Name
            </TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => handleRowClick(item.id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">
                {item.product.sku}
              </TableCell>
              <TableCell>{item.product.name}</TableCell>
              <TableCell>{item.warehouse.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {item.availableQuantity}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.totalValue)}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / 20)}
        onPageChange={(page) => {
          router.push(`/inventory?page=${page}`);
        }}
      />
    </div>
  );
}