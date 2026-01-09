import { Bom } from '../entities/bom.entity';
import { BomItem } from '../entities/bom-item.entity';
import { BomVersion } from '../entities/bom-version.entity';

export interface PaginatedBomsResponse {
  items: Bom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BomWithItemsResponse extends Bom {
  items: BomItem[];
}

export interface BomExplosionItem {
  level: number;
  itemType: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  scrapPercentage: number;
  effectiveQuantity: number;
  unitCost: number;
  totalCost: number;
  children?: BomExplosionItem[];
}

export interface BomExplosionResponse {
  bom: Bom;
  explosion: BomExplosionItem[];
  totalLevels: number;
  totalItems: number;
  totalCost: number;
}