import { StockMovement } from '../entities/stock-movement.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockReservation } from '../entities/stock-reservation.entity';

export interface PaginatedMovementsResponse {
  items: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedTransfersResponse {
  items: StockTransfer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAdjustmentsResponse {
  items: StockAdjustment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReservationsResponse {
  items: StockReservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}