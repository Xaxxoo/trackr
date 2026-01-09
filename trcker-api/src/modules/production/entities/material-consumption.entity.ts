import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductionOrder } from './production-order.entity';

export enum MaterialType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  COMPONENT = 'COMPONENT',
  PACKAGING = 'PACKAGING',
}

@Entity('material_consumptions')
@Index(['productionOrderId'])
@Index(['materialId'])
@Index(['consumedAt'])
export class MaterialConsumption {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Production order ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'production_order_id', type: 'uuid' })
  productionOrderId: string;

  @ApiProperty({
    description: 'Production order details',
  })
  @ManyToOne(() => ProductionOrder, (order) => order.materialConsumptions)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @ApiProperty({
    description: 'Material type',
    enum: MaterialType,
    example: MaterialType.RAW_MATERIAL,
  })
  @Column({
    name: 'material_type',
    type: 'enum',
    enum: MaterialType,
  })
  materialType: MaterialType;

  @ApiProperty({
    description: 'Material ID (raw material or product)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @ApiProperty({
    description: 'Material code',
    example: 'RM-COT-001',
  })
  @Column({ name: 'material_code', length: 100 })
  materialCode: string;

  @ApiProperty({
    description: 'Material name',
    example: 'Premium Cotton Fiber',
  })
  @Column({ name: 'material_name', length: 255 })
  materialName: string;

  @ApiProperty({
    description: 'Planned quantity',
    example: 52.5,
  })
  @Column({
    name: 'planned_quantity',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  plannedQuantity: number;

  @ApiProperty({
    description: 'Actual quantity consumed',
    example: 53.2,
  })
  @Column({
    name: 'actual_quantity',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  actualQuantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Variance',
    example: 0.7,
  })
  get variance(): number {
    return this.actualQuantity - this.plannedQuantity;
  }

  @ApiProperty({
    description: 'Variance percentage',
    example: 1.33,
  })
  get variancePercentage(): number {
    if (this.plannedQuantity === 0) return 0;
    return (this.variance / this.plannedQuantity) * 100;
  }

  @ApiProperty({
    description: 'Unit cost',
    example: 45.50,
  })
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitCost: number;

  @ApiProperty({
    description: 'Total cost',
    example: 2420.60,
  })
  get totalCost(): number {
    return this.actualQuantity * this.unitCost;
  }

  @ApiProperty({
    description: 'Batch number (if from specific batch)',
    required: false,
  })
  @Column({ name: 'batch_number', length: 100, nullable: true })
  batchNumber: string | null;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ApiProperty({
    description: 'Consumed by user ID',
  })
  @Column({ name: 'consumed_by', type: 'uuid' })
  consumedBy: string;

  @ApiProperty({
    description: 'Consumption timestamp',
  })
  @Column({ name: 'consumed_at', type: 'timestamp' })
  consumedAt: Date;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}