import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportCategory {
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  PRODUCTION = 'PRODUCTION',
  FINANCIAL = 'FINANCIAL',
  QUALITY = 'QUALITY',
  WAREHOUSE = 'WAREHOUSE',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

@Entity('report_templates')
@Index(['code'], { unique: true })
@Index(['category'])
@Index(['isActive'])
export class ReportTemplate {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Template code',
    example: 'INV-STOCK-001',
  })
  @Column({ unique: true, length: 100 })
  code: string;

  @ApiProperty({
    description: 'Template name',
    example: 'Stock Levels Report',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Report category',
    enum: ReportCategory,
    example: ReportCategory.INVENTORY,
  })
  @Column({
    type: 'enum',
    enum: ReportCategory,
  })
  category: ReportCategory;

  @ApiProperty({
    description: 'Report type/subtype',
    example: 'STOCK_LEVELS',
  })
  @Column({ name: 'report_type', length: 100 })
  reportType: string;

  @ApiProperty({
    description: 'Default format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @Column({
    name: 'default_format',
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.PDF,
  })
  defaultFormat: ReportFormat;

  @ApiProperty({
    description: 'Query/SQL template',
    required: false,
  })
  @Column({ name: 'query_template', type: 'text', nullable: true })
  queryTemplate: string | null;

  @ApiProperty({
    description: 'Parameters schema (JSON)',
  })
  @Column({ name: 'parameters_schema', type: 'jsonb', nullable: true })
  parametersSchema: any;

  @ApiProperty({
    description: 'Layout configuration (JSON)',
  })
  @Column({ name: 'layout_config', type: 'jsonb', nullable: true })
  layoutConfig: any;

  @ApiProperty({
    description: 'Is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Is system template',
    example: true,
  })
  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @ApiProperty({
    description: 'Created by user ID',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}