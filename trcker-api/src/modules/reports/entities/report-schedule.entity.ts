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
import { ReportTemplate } from './report-template.entity';

export enum ScheduleFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('report_schedules')
@Index(['templateId'])
@Index(['status'])
@Index(['nextRunDate'])
export class ReportSchedule {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Schedule name',
    example: 'Weekly Inventory Report',
  })
  @Column({ length: 255 })
  name: string;

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
    description: 'Frequency',
    enum: ScheduleFrequency,
    example: ScheduleFrequency.WEEKLY,
  })
  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
  })
  frequency: ScheduleFrequency;

  @ApiProperty({
    description: 'Status',
    enum: ScheduleStatus,
    example: ScheduleStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  status: ScheduleStatus;

  @ApiProperty({
    description: 'Parameters (JSON)',
  })
  @Column({ type: 'jsonb', nullable: true })
  parameters: any;

  @ApiProperty({
    description: 'Recipients (emails)',
  })
  @Column({ type: 'jsonb' })
  recipients: string[];

  @ApiProperty({
    description: 'Start date',
  })
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @ApiProperty({
    description: 'End date',
    required: false,
  })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @ApiProperty({
    description: 'Next run date',
  })
  @Column({ name: 'next_run_date', type: 'timestamp' })
  nextRunDate: Date;

  @ApiProperty({
    description: 'Last run date',
    required: false,
  })
  @Column({ name: 'last_run_date', type: 'timestamp', nullable: true })
  lastRunDate: Date | null;

  @ApiProperty({
    description: 'Run count',
    example: 5,
  })
  @Column({ name: 'run_count', default: 0 })
  runCount: number;

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