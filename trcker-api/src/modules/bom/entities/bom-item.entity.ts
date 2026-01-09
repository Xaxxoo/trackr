import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Bom } from './bom.entity';

export enum ItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  COMPONENT = 'COMPONENT',
  SUB_ASSEMBLY = 'SUB_ASSEMBLY',
  PACKAGING = 'PACKAGING',
}

export enum ItemConsumptionType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

@Entity('bom_items')
@Index(['bomId'])
@Index(['itemId'])
@Index(['sequenceNumber'])
export class BomItem {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'BOM ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @ApiProperty({
    description: 'BOM details',
  })
  @ManyToOne(() => Bom, (bom) => bom.items)
  @JoinColumn({ name: 'bom_id' })
  bom: Bom;

  @ApiProperty({
    description: 'Item type',
    enum: ItemType,
    example: ItemType.RAW_MATERIAL,
  })
  @Column({
    name: 'item_type',
    type: 'enum',
    enum: ItemType,
  })
  itemType: ItemType;

  @ApiProperty({
    description: 'Item ID (raw material or product)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @ApiProperty({
    description: 'Item reference name',
    example: 'Premium Cotton Fiber',
  })
  @Column({ name: 'item_name', length: 255 })
  itemName: string;

  @ApiProperty({
    description: 'Item reference code',
    example: 'RM-COT-001',
  })
  @Column({ name: 'item_code', length: 100 })
  itemCode: string;

  @ApiProperty({
    description: 'Sequence number for assembly order',
    example: 1,
  })
  @Column({ name: 'sequence_number', type: 'int', default: 1 })
  sequenceNumber: number;

  @ApiProperty({
    description: 'Quantity required per base quantity',
    example: 50,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'KG',
  })
  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @ApiProperty({
    description: 'Scrap percentage',
    example: 5,
  })
  @Column({
    name: 'scrap_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  scrapPercentage: number;

  @ApiProperty({
    description: 'Effective quantity including scrap',
    example: 52.5,
  })
  get effectiveQuantity(): number {
    return this.quantity * (1 + this.scrapPercentage / 100);
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
    example: 2387.50,
  })
  get totalCost(): number {
    return this.effectiveQuantity * this.unitCost;
  }

  @ApiProperty({
    description: 'Consumption type',
    enum: ItemConsumptionType,
    example: ItemConsumptionType.FIXED,
  })
  @Column({
    name: 'consumption_type',
    type: 'enum',
    enum: ItemConsumptionType,
    default: ItemConsumptionType.FIXED,
  })
  consumptionType: ItemConsumptionType;

  @ApiProperty({
    description: 'Whether item is optional',
    example: false,
  })
  @Column({ name: 'is_optional', default: false })
  isOptional: boolean;

  @ApiProperty({
    description: 'Whether item is critical',
    example: true,
  })
  @Column({ name: 'is_critical', default: false })
  isCritical: boolean;

  @ApiProperty({
    description: 'Reference designator',
    example: 'R1, R2',
    required: false,
  })
  @Column({ name: 'reference_designator', length: 255, nullable: true })
  referenceDesignator: string | null;

  @ApiProperty({
    description: 'Assembly instructions',
    required: false,
  })
  @Column({ name: 'assembly_instructions', type: 'text', nullable: true })
  assemblyInstructions: string | null;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}