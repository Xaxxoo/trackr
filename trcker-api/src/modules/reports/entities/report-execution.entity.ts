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
import { ReportTemplate } from './report-template.entity';
import { ReportFormat } from './report-template.entity';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('report_executions')
@Index(['templateId'])
@Index(['status'])
@Index(['createdAt'])
export class ReportExecution {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Execution number',
    example: 'EXEC-2024-000001',
  })
  @Column({ name: 'execution_number', length: 100 })
  executionNumber: string;

  @ApiProperty({
    description: 'Template ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ApiProperty({
    description: 'Template details',
  })
  @ManyToOne(() => ReportTemplate, { eager: true })
  @JoinColumn({ name: 'template_id' })
  template: ReportTemplate;

  @ApiProperty({
    description: 'Schedule ID',
    required: false,
  })
  @Column({ name: 'schedule_id', type: 'uuid', nullable: true })
  scheduleId: string | null;

  @ApiProperty({
    description: 'Status',
    enum: ExecutionStatus,
    example: ExecutionStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @ApiProperty({
    description: 'Format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @Column({
    type: 'enum',
    enum: ReportFormat,
  })
  format: ReportFormat;

  @ApiProperty({
    description: 'Parameters used (JSON)',
  })
  @Column({ type: 'jsonb', nullable: true })
  parameters: any;

  @ApiProperty({
    description: 'File path',
    required: false,
  })
  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath: string | null;

  @ApiProperty({
    description: 'File size in bytes',
    example: 245678,
    required: false,
  })
  @Column({ name: 'file_size', type: 'integer', nullable: true })
  fileSize: number | null;

  @ApiProperty({
    description: 'Execution start time',
  })
  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @ApiProperty({
    description: 'Execution end time',
    required: false,
  })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @ApiProperty({
    description: 'Duration in seconds',
    example: 2.5,
  })
  get duration(): number | null {
    if (!this.endTime) return null;
    return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
  }

  @ApiProperty({
    description: 'Error message',
    required: false,
  })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @ApiProperty({
    description: 'Row count',
    example: 156,
    required: false,
  })
  @Column({ name: 'row_count', type: 'integer', nullable: true })
  rowCount: number | null;

  @ApiProperty({
    description: 'Created by user ID',
  })
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}