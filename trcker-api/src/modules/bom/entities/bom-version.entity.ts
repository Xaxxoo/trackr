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
import { Bom } from './bom.entity';

export enum VersionChangeType {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  PATCH = 'PATCH',
}

@Entity('bom_versions')
@Index(['bomId'])
@Index(['versionNumber'])
export class BomVersion {
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
  @ManyToOne(() => Bom, (bom) => bom.versions)
  @JoinColumn({ name: 'bom_id' })
  bom: Bom;

  @ApiProperty({
    description: 'Version number',
    example: '1.0',
  })
  @Column({ name: 'version_number', length: 20 })
  versionNumber: string;

  @ApiProperty({
    description: 'Revision number',
    example: 1,
  })
  @Column({ name: 'revision_number', type: 'int' })
  revisionNumber: number;

  @ApiProperty({
    description: 'Change type',
    enum: VersionChangeType,
    example: VersionChangeType.MAJOR,
  })
  @Column({
    name: 'change_type',
    type: 'enum',
    enum: VersionChangeType,
  })
  changeType: VersionChangeType;

  @ApiProperty({
    description: 'Change description',
  })
  @Column({ name: 'change_description', type: 'text' })
  changeDescription: string;

  @ApiProperty({
    description: 'Snapshot of BOM data',
  })
  @Column({ type: 'jsonb' })
  snapshot: any;

  @ApiProperty({
    description: 'Created by user ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}