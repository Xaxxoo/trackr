import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('stock_reservations')
@Index(['reservationNumber'], { unique: true })
@Index(['warehouseId'])
@Index(['productId'])
@Index(['status'])
@Index(['expiryDate'])
export class StockReservation {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Reservation number',
    example: 'RSV-2024-001',
  })
  @Column({ name: 'reservation_number', unique: true, length: 100 })
  reservationNumber: string;

  @ApiProperty({
    description: 'Warehouse ID',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Product ID',
  })
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 50,
  })
  @Column({
    name: 'reserved_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  reservedQuantity: number;

  @ApiProperty({
    description: 'Fulfilled quantity',
    example: 0,
  })
  @Column({
    name: 'fulfilled_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  fulfilledQuantity: number;

  @ApiProperty({
    description: 'Remaining quantity',
    example: 50,
  })
  get remainingQuantity(): number {
    return Number(this.reservedQuantity) - Number(this.fulfilledQuantity);
  }

  @ApiProperty({
    description: 'Unit of measure',
    example: 'PIECES',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Reference type',
    example: 'SalesOrder',
  })
  @Column({ name: 'reference_type', length: 100 })
  referenceType: string;

  @ApiProperty({
    description: 'Reference ID',
  })
  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId: string;

  @ApiProperty({
    description: 'Reference number',
    example: 'SO-2024-001',
  })
  @Column({ name: 'reference_number', length: 100 })
  referenceNumber: string;

  @ApiProperty({
    description: 'Reservation date',
  })
  @Column({ name: 'reservation_date', type: 'timestamp' })
  reservationDate: Date;

  @ApiProperty({
    description: 'Expiry date',
  })
  @Column({ name: 'expiry_date', type: 'timestamp' })
  expiryDate: Date;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Created by user ID',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}