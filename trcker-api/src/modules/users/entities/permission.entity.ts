import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Resource {
  USERS = 'users',
  ROLES = 'roles',
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  INVENTORY = 'inventory',
  WAREHOUSES = 'warehouses',
  PRODUCTION = 'production',
  BOM = 'bom',
  SALES = 'sales',
  CUSTOMERS = 'customers',
  REPORTS = 'reports',
  AUDIT = 'audit',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  MANAGE = 'manage',
  EXPORT = 'export',
}

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Resource name',
    enum: Resource,
    example: Resource.INVENTORY,
  })
  @Column({ type: 'varchar', length: 50 })
  resource: Resource;

  @ApiProperty({
    description: 'Action name',
    enum: Action,
    example: Action.CREATE,
  })
  @Column({ type: 'varchar', length: 50 })
  action: Action;

  @ApiProperty({
    description: 'Permission description',
    example: 'Create inventory transactions',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}