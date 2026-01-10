import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  IsEmail,
  IsDateString,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleFrequency } from '../entities/report-schedule.entity';

export class CreateReportScheduleDto {
  @ApiProperty({
    description: 'Schedule name',
    example: 'Weekly Inventory Report',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Template ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'Frequency',
    enum: ScheduleFrequency,
    example: ScheduleFrequency.WEEKLY,
  })
  @IsEnum(ScheduleFrequency)
  @IsNotEmpty()
  frequency: ScheduleFrequency;

  @ApiPropertyOptional({
    description: 'Parameters',
  })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiProperty({
    description: 'Recipients',
    example: ['user1@example.com', 'user2@example.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  recipients: string[];

  @ApiProperty({
    description: 'Start date (ISO 8601)',
    example: '2024-01-10',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}