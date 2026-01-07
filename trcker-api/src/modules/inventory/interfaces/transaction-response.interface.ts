import { InventoryTransaction } from '../entities/inventory-transaction.entity';

export interface PaginatedTransactionsResponse {
  items: InventoryTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalValue: number;
  inTransactions: number;
  outTransactions: number;
  adjustmentTransactions: number;
  transferTransactions: number;
}